const { Op } = require("sequelize");
const { Popup } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.createPopup = async (req, res) => {
    try {
        const { content } = req.body;

        await Popup.create({ content });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Popup | Create", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.releasePopup = async (req, res) => {
    try {
        const popup = await Popup.findByPk(req.params.id);
        if (!popup) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_POPUP,
            });
        }

        await popup.update({ status: 1 });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Popup | Release", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.deletePopup = async (req, res) => {
    try {
        await Popup.destroy({ where: { id: req.params.id } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Popup | Delete", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAllPopups = async (req, res) => {
    try {
        const { start, search, draw, length, order, dir } = req.query;

        const query = {
            [Op.or]: [{ content: { [Op.substring]: search } }],
        };

        const result = await Popup.findAndCountAll({
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
        logger("error", "API | Popup | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
