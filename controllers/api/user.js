const { Op } = require("sequelize");
const { User, Agent, UserTransaction, UserBalanceProgress, AgentBalanceProgress } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllUsersForDT = async (req, res) => {
    try {
        const authInfo = req.session.auth;
        const { start, search, draw, length, order, dir, agentCode } = req.query;

        let users;
        let query = {};

        if (search) {
            query = { userCode: { [Op.substring]: search } };
        }

        if (agentCode == "all" || !agentCode) {
            query = { ...query, parentPath: { [Op.substring]: `.${authInfo.id}.` } };
            users = await User.findAndCountAll({
                where: query,
                offset: Number(start),
                limit: Number(length),
                order: [[order, dir]],
            });
        } else {
            query = { ...query, agentCode };
            users = await User.findAndCountAll({
                where: query,
                offset: Number(start),
                limit: Number(length),
                order: [[order, dir]],
            });
        }

        return res.json({
            status: 1,
            data: users.rows,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: users.count,
            recordsFiltered: users.count,
        });
    } catch (error) {
        logger("error", "API | User | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const authInfo = req.session.auth;

        const users = await User.findAll({
            where: { parentPath: { [Op.substring]: `.${authInfo.id}.` } },
        });

        return res.json({
            status: 1,
            data: users,
        });
    } catch (error) {
        logger("error", "API | User | Get All List", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getUsersByAgent = async (req, res) => {
    try {
        const { code } = req.params;

        let users = await User.findAndCountAll({
            where: code != "0" ? { agentCode: code } : "",
            order: ["userCode"],
        });

        return res.json({
            status: 1,
            data: users.rows,
        });
    } catch (error) {
        logger("error", "API | User | Get By Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.updateAgentUser = async (req, res) => {
    try {
        const { status } = req.body;
        const { code } = req.params;

        await User.update({ status }, { where: { agentCode: code } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | User | Update", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await User.findByPk(req.params.id);
        if (!user) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_USER,
            });
        }

        return res.json({
            status: 1,
            data: user,
        });
    } catch (error) {
        logger("error", "API | User | Get By ID", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.changeRtp = async (req, res) => {
    try {
        const { method, code, rtp } = req.body;

        if (method == "user") {
            await User.update({ targetRtp: rtp }, { where: { id: code } });
        } else if (method == "agent") {
            await User.update({ targetRtp: rtp }, { where: { agentCode: code } });
        }

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | User | Change Rtp", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.exchangeUser = async (req, res) => {
    try {
        const { userCode, chargeType } = req.body;
        const amount = Number(req.body.amount);

        const user = await User.findOne({ where: { userCode } });
        const agent = await Agent.findOne({ where: { agentCode: user.agentCode } });

        if (!user) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_USER,
            });
        }

        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        const userPrevBalance = Number(user.balance);
        const agentPrevBalance = Number(agent.balance);

        let userAfterBalance = 0;
        let agentAfterBalance = 0;

        if (chargeType == 1) {
            if (agentPrevBalance < amount) {
                return res.json({
                    status: 0,
                    msg: ERR_MSG.INSUFFICIENT_AGENT_FUNDS,
                });
            }

            userAfterBalance = userPrevBalance + amount;
            agentAfterBalance = agentPrevBalance - amount;
        } else {
            if (userPrevBalance < amount) {
                return res.json({
                    status: 0,
                    msg: ERR_MSG.INSUFFICIENT_USER_FUNDS,
                });
            }

            userAfterBalance = userPrevBalance - amount;
            agentAfterBalance = agentPrevBalance + amount;
        }

        await agent.update({ balance: agentAfterBalance });
        await user.update({ balance: userAfterBalance });

        UserTransaction.create({
            agentCode: agent.agentCode,
            userCode: user.userCode,
            chargeAmount: amount,
            agentPrevBalance: agentPrevBalance,
            agentAfterBalance: agentAfterBalance,
            userPrevBalance: userPrevBalance,
            userAfterBalance: userAfterBalance,
            chargeType,
            status: 1,
            parentPath: user.parentPath,
        });

        UserBalanceProgress.create({
            agentCode: agent.agentCode,
            userCode: user.userCode,
            userBalance: userAfterBalance,
            comment: `[${chargeType == 1 ? "Deposit" : "Withdraw"}] ${amount} (Site)`,
            parentPath: user.parentPath,
        });

        AgentBalanceProgress.create({
            agentCode: agent.agentCode,
            agentBalance: agentAfterBalance,
            comment: `[User ${chargeType == 1 ? "Deposit" : "Withdraw"}] (${userCode}) ${amount} (Site)`,
            parentPath: agent.parentPath,
        });

        logger("info", "API | User | Exchange", `Success ${agent.agentCode} (${agentAfterBalance}) - ${userCode} (${userAfterBalance}) - ${amount}`, req);

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | User | Exchange", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
