const { Op } = require("sequelize");
const { AgentBalanceProgress } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.getAllProgresses = async (req, res) => {
    try {
        const { agentCode, startDate, endDate, search, dir, order, start, length } = req.query;

        const startDateFormated = new Date(new Date(startDate).setHours(0, 0, 0));
        const endDateFormated = new Date(new Date(endDate).setHours(24, 0, 0));

        let baseQuery = {
            [Op.or]: [{ agentCode: { [Op.substring]: search } }, { comment: { [Op.substring]: search } }],
            createdAt: { [Op.between]: [startDateFormated, endDateFormated] },
        };

        let query;
        if (agentCode == "all") {
            query = { ...baseQuery, [Op.or]: [{ parentPath: { [Op.substring]: `.${req.session.auth.id}.` } }, { agentCode: req.session.auth.agentCode }] };
        } else {
            query = { ...baseQuery, agentCode: agentCode };
        }

        const data = await AgentBalanceProgress.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [
                [order, dir],
                ["id", dir],
            ],
            attributes: ["agentCode", "agentBalance", "comment", "createdAt"],
        });

        return res.json({
            status: 1,
            data: data.rows,
            start: Number(start),
            recordsTotal: data.count,
            recordsFiltered: data.count,
        });
    } catch (error) {
        logger("error", "API | Agent Balance Progress | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
