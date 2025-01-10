const moment = require("moment");
const { Op } = require("sequelize");
const { Agent, AgentTransaction, sequelize } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllTransactions = async (req, res) => {
    try {
        const authInfo = req.session.auth;
        const { start, search, draw, length, order, dir, agentCode, startDate, endDate } = req.query;
        const method = Number(req.query.method);
        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        let query = {
            [Op.or]: [{ parentCode: { [Op.substring]: search } }, { agentCode: { [Op.substring]: search } }],
            createdAt: { [Op.between]: [startDateFormated, endDateFormated] },
        };
        let chargeType = 1; // 0: 환전, 1: 충전

        if (method == 3) {
            // 전체 환전 내역
            chargeType = 0;
        }

        if (agentCode == "all") {
            // 전체 에이젼트
            query = {
                [Op.and]: [
                    { ...query },
                    {
                        [Op.or]: [
                            { parentCode: authInfo.agentCode },
                            { agentCode: authInfo.agentCode },
                            { parentPath: { [Op.substring]: `.${authInfo.id}.` } },
                        ],
                    },
                ],
            };

            if (method != 0) {
                query = { ...query, chargeType: chargeType };
            }
        } else {
            // 선택한 에이젼트

            query = {
                [Op.and]: [
                    { ...query },
                    {
                        [Op.or]: [{ parentCode: agentCode }, { agentCode: agentCode }],
                    },
                ],
            };

            if (method == 1) {
                // 충전 해준 내역
                query = {
                    ...query,
                    chargeType: chargeType,
                    parentCode: agentCode,
                };
            } else if (method == 2) {
                // 충전 받은 내역
                query = {
                    ...query,
                    chargeType: chargeType,
                    agentCode: agentCode,
                };
            } else if (method == 3) {
                // 전체 환전 내역
                query = {
                    ...query,
                    chargeType: chargeType,
                };
            }
            // else : 전체 충환전 내역
        }

        const transactions = await AgentTransaction.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
                ["id", dir],
            ],
        });

        return res.json({
            status: 1,
            data: transactions.rows,
            draw: Number(draw),
            start: Number(start),
            recordsTotal: transactions.count,
            recordsFiltered: transactions.count,
        });
    } catch (error) {
        logger("error", "API | Agent Transaction | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getTransactionsByAgent = async (req, res) => {
    try {
        const method = Number(req.query.method);

        const agent = await Agent.findByPk(req.params.id);
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        let transactions;

        if (method == 1) {
            transactions = await AgentTransaction.findAndCountAll({
                where: { parentCode: agent.agentCode },
            });
        } else if (method == 2) {
            transactions = await AgentTransaction.findAndCountAll({
                where: { agentCode: agent.agentCode },
            });
        } else {
            transactions = await AgentTransaction.findAndCountAll({
                where: {
                    [Op.or]: [{ parentCode: agent.agentCode }, { agentCode: agent.agentCode }],
                },
            });
        }

        return res.json({
            status: 1,
            data: transactions.rows,
            count: transactions.count,
        });
    } catch (error) {
        logger("error", "API | Agent Transaction | Get By Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getTransactionByType = async (req, res) => {
    try {
        const authInfo = req.session.auth;

        const today = moment().format("YYYY-MM-DD HH:mm:ss");
        const startDate = moment().subtract(7, "days").format("YYYY-MM-DD HH:mm:ss");

        const withdrawQuery = `SELECT SUM(CASE WHEN chargeType = 0 THEN chargeAmount ELSE 0 END) AS discharge, DATE(createdAt) AS date FROM  agent_transactions WHERE parentCode = '${authInfo.agentCode}' AND createdAt BETWEEN '${startDate}' AND '${today}' GROUP BY DATE(createdAt)`;
        const depositQuery = `SELECT SUM(CASE WHEN chargeType = 1 THEN chargeAmount ELSE 0 END) AS charge, DATE(createdAt) AS date FROM  agent_transactions WHERE parentCode = '${authInfo.agentCode}' AND createdAt BETWEEN '${startDate}' AND '${today}' GROUP BY DATE(createdAt);`;

        const depositData = await sequelize.query(depositQuery);
        const withdrawData = await sequelize.query(withdrawQuery);

        return res.json({
            status: 1,
            deposit: depositData[0],
            withdraw: withdrawData[0],
        });
    } catch (error) {
        logger("error", "API | User Transaction | Get Info", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
