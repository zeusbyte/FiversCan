const { Op } = require("sequelize");
const { Checkup } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.createCheckup = async (req, res) => {
    try {
        const count = await Checkup.count({ where: { status: 0 } });
        if (count > 0) {
            return res.json({
                status: 0,
                msg: ERR_MSG.NOW_CHECKING,
            });
        }

        await Checkup.create(req.body);

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Checkup | Create", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.releaseCheckup = async (req, res) => {
    try {
        const checkup = await Checkup.findByPk(req.params.id);
        if (!checkup) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_CHECKUP,
            });
        }

        await checkup.update({ status: 1 });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Checkup | Release", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.deleteCheckup = async (req, res) => {
    try {
        await Checkup.destroy({ where: { id: req.params.id } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Checkup | Delete", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAllCheckups = async (req, res) => {
    try {
        const { start, search, draw, length, order, dir } = req.query;

        const query = {
            [Op.or]: [{ content: { [Op.substring]: search } }],
        };

        const result = await Checkup.findAndCountAll({
            where: query,
            offset: Number(start),
            limit: Number(length),
            order: [[order, dir]],
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
        logger("error", "API | Checkup | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
