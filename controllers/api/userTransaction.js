const { Op } = require("sequelize");
const { Agent, UserTransaction } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllTransactions = async (req, res) => {
    try {
        const authInfo = req.session.auth;
        const { start, search, draw, length, order, dir, agentCode, userCode, startDate, endDate } = req.query;
        const method = Number(req.query.method);
        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        let transactions;
        let query = {
            [Op.or]: [{ agentCode: { [Op.substring]: search } }, { userCode: { [Op.substring]: search } }],
            createdAt: { [Op.between]: [startDateFormated, endDateFormated] },
        };
        let chargeType = 1; // 0: 환전, 1: 충전

        if (method == 2) {
            // 환전 받은 내역
            chargeType = 0;
        }

        if (agentCode == "all") {
            // 전체 에이젼트에 속한 회원충환전목록 얻기 (에이젼트와 회원별에 따라서도)
            if (userCode == "all") {
                query = { ...query, parentPath: { [Op.substring]: `.${authInfo.id}.` } };
            } else {
                query = { ...query, parentPath: { [Op.substring]: `.${authInfo.id}.` }, userCode };
            }
        } else {
            // 선택한 에이젼트에 속한 회원충환전목록 얻기 (에이젼트와 회원별에 따라서도)

            if (userCode == "all") {
                query = { ...query, agentCode };
            } else {
                query = { ...query, agentCode, userCode };
            }
        }

        if (method != 0) {
            query = { ...query, chargeType: chargeType };
        }

        transactions = await UserTransaction.findAndCountAll({
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
        logger("error", "API | User Transaction | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getTransactionsByAgent = async (req, res) => {
    try {
        const transactions = await UserTransaction.findAndCountAll({
            where: { agentCode: req.params.code },
        });

        return res.json({
            status: 1,
            data: transactions.rows,
            count: transactions.count,
        });
    } catch (error) {
        logger("error", "API | User Transaction | Get By Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
