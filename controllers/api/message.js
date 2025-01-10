const { Op } = require("sequelize");
const { Message, Agent } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.createMessage = async (req, res) => {
    try {
        const { messageTitle, messageContent } = req.body;

        const parentAgent = await Agent.findByPk(req.session.auth.id);
        const receiverAgent = await Agent.findByPk(parentAgent.parentId);

        if (!parentAgent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        if (!receiverAgent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PARENT_AGENT,
            });
        }

        const parentPath = parentAgent.parentPath + parentAgent.id + ".";

        await Message.create({
            parentCode: parentAgent.agentCode,
            receiverCode: receiverAgent.agentCode,
            messageTitle,
            messageContent,
            parentPath,
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Message | Create", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.answerMessage = async (req, res) => {
    try {
        const { id } = req.params;
        const { answerContent } = req.body;

        const message = await Message.findByPk(id);
        if (!message) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_MESSAGE,
            });
        }

        await message.update({
            answerStatus: 1,
            answerContent,
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Message | Answer", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.deleteMessage = async (req, res) => {
    try {
        await Message.destroy({ where: { id: req.params.id } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Message | Delete", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getMessageById = async (req, res) => {
    try {
        const message = await Message.findByPk(req.params.id);

        if (req.session.auth.agentCode == message.receiverCode && message.readStatus == 0 && message.answerStatus == 0) {
            await message.update({ readStatus: 1 });
        }

        if (!message) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_MESSAGE,
            });
        }

        return res.json({
            status: 1,
            message,
        });
    } catch (error) {
        logger("error", "API | Message | Get By ID", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAllMessages = async (req, res) => {
    try {
        const { start, search, draw, length, order, dir, agentCode } = req.query;

        let query = {
            [Op.or]: [
                { messageTitle: { [Op.substring]: search } },
                { messageContent: { [Op.substring]: search } },
                { answerContent: { [Op.substring]: search } },
            ],
        };

        if (agentCode == "all") {
            query = { ...query, parentPath: { [Op.substring]: `.${req.session.auth.id}.` } };
        } else {
            query = { [Op.and]: [{ ...query }, { [Op.or]: [{ parentCode: agentCode }, { receiverCode: agentCode }] }] };
        }

        const result = await Message.findAndCountAll({
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
        logger("error", "API | Message | Get All", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
