const { Op } = require("sequelize");
const { SlotGameTransaction, LiveGameTransaction } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllGameTransactions = async (req, res) => {
    try {
        const { search, order, dir, agentCode, userCode, length, start, startDate, endDate, gameType } = req.query;

        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        let baseQuery = { createdAt: { [Op.between]: [startDateFormated, endDateFormated] } };

        let query;
        if (agentCode == "all" && userCode == "all") {
            query = {
                ...baseQuery,
                parentPath: { [Op.substring]: `.${req.session.auth.id}.` },
            };
        } else if (agentCode == "all" && userCode != "all") {
            query = {
                ...baseQuery,
                parentPath: { [Op.substring]: `.${req.session.auth.id}.` },
                userCode: userCode,
            };
        } else if (agentCode != "all" && userCode == "all") {
            query = {
                ...baseQuery,
                agentCode: agentCode,
            };
        } else {
            query = {
                ...baseQuery,
                agentCode: agentCode,
                userCode: userCode,
            };
        }
        let gameTransactions = [];
        if (gameType == "slot") {
            gameTransactions = await SlotGameTransaction.findAndCountAll({
                where: {
                    [Op.or]: [
                        { agentCode: { [Op.substring]: search } },
                        { userCode: { [Op.substring]: search } },
                        { providerCode: { [Op.substring]: search } },
                        { gameCode: { [Op.substring]: search } },
                        { type: { [Op.substring]: search } },
                        { txnType: { [Op.substring]: search } },
                    ],
                    [Op.and]: query,
                },
                offset: Number(start),
                limit: Number(length),
                order: [
                    [order, dir],
                    ["id", dir],
                ],
            });
        } else {
            gameTransactions = await LiveGameTransaction.findAndCountAll({
                where: {
                    [Op.or]: [
                        { agentCode: { [Op.substring]: search } },
                        { userCode: { [Op.substring]: search } },
                        { providerCode: { [Op.substring]: search } },
                        { gameCode: { [Op.substring]: search } },
                        { type: { [Op.substring]: search } },
                        { txnType: { [Op.substring]: search } },
                    ],
                    [Op.and]: query,
                },
                offset: Number(start),
                limit: Number(length),
                order: [
                    [order, dir],
                    ["id", dir],
                ],
            });
        }

        return res.json({
            status: 1,
            data: gameTransactions.rows,
            count: gameTransactions.count,
        });
    } catch (error) {
        logger("error", "API | Game Transaction | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
