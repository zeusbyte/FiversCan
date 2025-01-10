const { Op } = require("sequelize");
const { Player, Agent, User, Provider, Call, AgentBalanceProgress, sequelize } = require("../../models");
const config = require("../../config/main");
const logger = require("../../utils/logger");
const isEmpty = require("../../utils/isEmpty");
const rand = require("../../utils/rand");
const { ERR_MSG } = require("../../utils/constants");
const { requestForSlot } = require("../../utils/request");

exports.getPlayers = async (req, res) => {
    try {
        const sessionAgentCode = req.session.auth.agentCode;
        const { start, search, draw, length, order, dir } = req.query;

        let searchQuery = {
            [Op.or]: [{ userCode: { [Op.substring]: search } }, { providerCode: { [Op.substring]: search } }, { gameCode: { [Op.substring]: search } }],
        };

        let realSorter;
        if (order == "totalDebit") {
            realSorter = [{ model: User, as: "user" }, "totalDebit", dir];
        } else if (order == "totalCredit") {
            realSorter = [{ model: User, as: "user" }, "totalCredit", dir];
        } else if (order == "balance") {
            realSorter = [{ model: User, as: "user" }, "balance", dir];
        } else {
            realSorter = [order, dir];
        }

        const players = await Player.findAndCountAll({
            where: {
                ...searchQuery,
                agentCode: sessionAgentCode,
                status: "PLAYING",
                updatedAt: { [Op.between]: [new Date(new Date() - 1000 * 60 * 15), new Date()] },
            },
            offset: Number(start),
            limit: Number(length),
            order: [realSorter],
            include: [
                {
                    model: User,
                    attributes: ["targetRtp", "realRtp", "totalDebit", "totalCredit", "balance"],
                    as: "user",
                },
            ],
        });

        const result = players.rows.map((player) => ({
            userCode: player.userCode,
            providerCode: player.providerCode,
            gameCode: player.gameCode,
            bet: player.lastBet,
            balance: player.user.balance,
            totalDebit: player.user.totalDebit,
            totalCredit: player.user.totalCredit,
            targetRtp: player.user.targetRtp,
            realRtp: player.user.realRtp,
        }));

        return res.json({
            status: 1,
            data: result,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: players.count,
            recordsFiltered: players.count,
        });
    } catch (error) {
        logger("error", "API | Call | Get Players", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getCallList = async (req, res) => {
    try {
        const { providerCode, gameCode } = req.body;

        const provider = await Provider.findOne({ where: { code: providerCode } });
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        let response = await requestForSlot("Call | Get Call List", "POST", `${provider.endpoint}/api/call_list`, { gameCode });

        if (response.status != 1) {
            return res.json({
                status: 0,
                msg: ERR_MSG.EXTERNAL_ERROR,
            });
        }

        if (isEmpty(response.calls)) {
            return res.json({
                status: 0,
                msg: ERR_MSG.NOT_FOUND_CALL,
            });
        }

        return res.json({
            status: 1,
            calls: response.calls,
        });
    } catch (error) {
        logger("error", "API | Call | Get Call List", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.applyCall = async (req, res) => {
    try {
        const { agentCode, userCode, providerCode, gameCode, callRtp, callWin, callType } = req.body;
        const agent = await Agent.findOne({ where: { agentCode } });
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        const user = await User.findOne({ where: { userCode } });
        if (!user) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_USER,
            });
        }

        if (Number(agent.balance) - Number(callWin) < 0) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INSUFFICIENT_AGENT_FUNDS,
            });
        }

        const player = await Player.findOne({ where: { agentCode, userCode, providerCode, gameCode } });
        if (!player) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PLAYER,
            });
        }

        // let bet = (callWin / callRtp) * 100;
        // // 1760.0000000000002  이런식으로 되어 같지않은걸로 비교되어서 아래와 같은 isEqual 방식으로 진행
        // let isEqual = Math.abs(player.lastBet - bet) < 0.00000001;
        // // if (bet != player.lastBet) {
        // if (!isEqual) {
        //         return res.json({
        //         status: 0,
        //         msg: ERR_MSG.PLAYER_BET_CHANGED,
        //     });
        // }

        const provider = await Provider.findOne({ where: { code: providerCode } });
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        const existCall = await Call.findOne({ where: { agentCode, userCode, providerCode, gameCode, status: { [Op.in]: [0, 1] } } });
        console.log(existCall);
        if (existCall) {
            return res.json({
                status: 0,
                msg: ERR_MSG.EXIST_CALL,
            });
        }

        const callRealRtp = (Number(callWin) / Number(player.lastBet)) * 100;

        const newCall = await Call.create({
            agentCode,
            userCode,
            providerCode,
            gameCode,
            serverCallId: 0,
            bet: player.lastBet,
            rtp: callRealRtp,
            type: callType,
            status: 0,
            parentPath: user.parentPath,
            expect: callWin,
            missed: callWin,
            real: 0,
        });

        const requestData = {
            agentCode: config.masterCode,
            userCode: `${agentCode}.GL.${userCode}`,
            gameCode,
            agentDBId: newCall.id,
            agentCallTime: Date.now(),
            call: {
                rtp: callRtp,
                win: callWin,
                call_type: callType,
                bet: player.lastBet,
            },
        };
        const response = await requestForSlot("Call | Apply Call", "POST", `${provider.endpoint}/api/call_apply`, requestData);

        if (response.status != 1) {
            return res.json({
                status: 0,
                msg: ERR_MSG.EXTERNAL_ERROR,
            });
        }

        const callId = response.call_id ? response.call_id : 0;

        // decrease agent balance
        const agentBeforeBalance = Number(agent.balance);
        const agentAfterBalance = agentBeforeBalance - Number(callWin);

        newCall.update({
            serverCallId: callId,
            agentPrev: agentBeforeBalance,
            agentAfter: agentAfterBalance,
        });

        if (!isNaN(agentAfterBalance) && agentAfterBalance >= 0) {
            await agent.update({ balance: agentAfterBalance });
        }

        AgentBalanceProgress.create({
            agentCode: agentCode,
            agentBalance: agentAfterBalance,
            comment: `[Call Applied] (${userCode} | ${providerCode} | ${gameCode}): ${callWin}`,
            parentPath: agent.parentPath,
        });

        logger("info", "Call | Apply Call", `agentCode: ${agentCode}, userCode: ${userCode}, providerCode: ${providerCode}, gameCode: ${gameCode}, callMoney: ${callWin}`, req);

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Call | Apply Call", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.cancelCall = async (req, res) => {
    try {
        const { agentCode, callId } = req.body;

        const call = await Call.findOne({ where: { id: callId, status: 0 } });
        if (!call) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_CALL,
            });
        }

        const agent = await Agent.findOne({ where: { agentCode } });
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        const providerCode = call.providerCode;

        const provider = await Provider.findOne({ where: { code: providerCode } });
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        const response = await requestForSlot("Call | Cancel Call", "POST", `${provider.endpoint}/api/call_cancel`, { callId: call.serverCallId });

        if (response.status != 1) {
            return res.json({
                status: 0,
                msg: ERR_MSG.EXTERNAL_ERROR,
            });
        }

        const callMoney = (Number(call.bet) * Number(call.rtp)) / 100;

        // increase agent balance

        const agentPrev = Number(agent.balance);
        const agentAfter = agentPrev + callMoney;

        //because agent prev is correct ... so don't save
        await call.update({ status: 4, msg: "Canceled by Admin", agentAfter });

        if (!isNaN(agentAfter) && agentAfter >= 0) {
            await agent.update({ balance: agentAfter });
        }

        AgentBalanceProgress.create({
            agentCode: agentCode,
            agentBalance: agentAfter,
            comment: `[Call Canceled] (${call.userCode} | ${providerCode} | ${call.gameCode}): ${callMoney}`,
            parentPath: agent.parentPath,
        });

        logger("info", "Call | Cancel Call", `agentCode: ${agentCode}, userCode: ${call.userCode}, providerCode: ${providerCode}, gameCode: ${call.gameCode}, callMoney: ${call.win}`, req);

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Call | Cancel Call", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getCallHistory = async (req, res) => {
    try {
        const { start, draw, length, search, order, dir, agentCode, userCode, startDate, endDate } = req.query;

        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        const sessionAuthId = req.session.auth.id;

        let realOrder = [];

        if (order == "callMoney") {
            // bet 마당과 rtp 마당 곱해서 sort
            realOrder = [[sequelize.literal("(bet * rtp)"), dir]];
        } else {
            realOrder = [[order, dir]];
        }

        let query;

        if (agentCode == "all" && userCode == "all") {
            query = { parentPath: { [Op.substring]: `.${sessionAuthId}.` } };
        } else if (agentCode == "all" && userCode != "all") {
            query = {
                parentPath: { [Op.substring]: `.${sessionAuthId}.` },
                userCode: userCode,
            };
        } else if (agentCode != "all" && userCode == "all") {
            query = { agentCode: agentCode };
        } else {
            query = { agentCode: agentCode, userCode: userCode };
        }

        let baseQuery = {
            [Op.or]: [{ agentCode: { [Op.substring]: search } }, { userCode: { [Op.substring]: search } }, { providerCode: { [Op.substring]: search } }, { gameCode: { [Op.substring]: search } }],
            [Op.and]: [
                query,
                { status: { [Op.ne]: 0 } },
                {
                    createdAt: { [Op.between]: [startDateFormated, endDateFormated] },
                },
            ],
        };

        const result = await Call.findAndCountAll({
            where: baseQuery,
            offset: Number(start),
            limit: Number(length),
            order: realOrder,
        });

        return res.json({
            status: 1,
            data: result.rows,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: result.count,
            recordsFiltered: result.count,
        });
    } catch (error) {
        logger("error", "API | Call | Get Call History", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.controlRtp = async (req, res) => {
    try {
        const { agentCode, userCode, providerCode, rtp } = req.body;

        const provider = await Provider.findOne({ where: { code: providerCode } });
        if (!provider) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PROVIDER,
            });
        }

        const requestData = {
            agentCode: config.masterCode,
            userCode: `${agentCode}.GL.${userCode}`,
            rtp,
        };

        const response = await requestForSlot("Call | Control Rtp", "POST", `${provider.endpoint}/api/rtp_control`, requestData);

        if (response.status != 1) {
            return res.json({
                status: 0,
                msg: ERR_MSG.EXTERNAL_ERROR,
            });
        }

        await User.update({ targetRtp: rtp }, { where: { agentCode, userCode } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Call | Control Rtp", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getCallResult = async (req, res) => {
    try {
        const sessionAgentCode = req.session.auth.agentCode;
        const { start, draw, length, search, order, dir, date } = req.query;

        const startDate = new Date(new Date(date).setHours(0, 0, 0));
        const endDate = new Date(new Date(date).setHours(24, 0, 0));

        let realOrder = [];
        if (order == "callMoney") {
            // bet 마당과 rtp 마당 곱해서 sort
            realOrder = [[sequelize.literal("(bet * rtp)"), dir]];
        } else {
            realOrder = [[order, dir]];
        }

        const query = {
            [Op.or]: [{ agentCode: { [Op.substring]: search } }, { userCode: { [Op.substring]: search } }, { providerCode: { [Op.substring]: search } }, { gameCode: { [Op.substring]: search } }],
            [Op.and]: [
                { agentCode: sessionAgentCode },
                {
                    createdAt: { [Op.between]: [startDate, endDate] },
                },
            ],
        };

        const result = await Call.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: realOrder,
        });

        return res.json({
            status: 1,
            data: result.rows,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: result.count,
            recordsFiltered: result.count,
        });
    } catch (error) {
        logger("error", "API | Call | Get Result", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
