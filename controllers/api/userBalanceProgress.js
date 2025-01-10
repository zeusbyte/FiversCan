const { Op } = require("sequelize");
const { UserBalanceProgress } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllProgresses = async (req, res) => {
    try {
        const { agentCode, userCode, startDate, endDate, search, dir, order, start, length } = req.query;

        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        let baseQuery = {
            [Op.or]: [{ comment: { [Op.substring]: search } }, { agentCode: { [Op.substring]: search } }, { userCode: { [Op.substring]: search } }],
            createdAt: { [Op.between]: [startDateFormated, endDateFormated] },
        };

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

        const data = await UserBalanceProgress.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
                ["id", dir],
            ],
            attributes: ["agentCode", "userCode", "userBalance", "comment", "createdAt"],
        });

        return res.json({
            status: 1,
            data: data.rows,
            start: Number(start),
            recordsTotal: data.count,
            recordsFiltered: data.count,
        });
    } catch (error) {
        logger("error", "API | User Balance Progress | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
