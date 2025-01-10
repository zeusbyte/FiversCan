const Joi = require("joi");

const schemas = {
    create: Joi.object({
        parentId: Joi.string().required(),
        agentCode: Joi.string().required(),
        agentName: Joi.string().required(),
        agentType: Joi.number().integer().min(0).required(),
        password: Joi.string().required(),
        percent: Joi.number().min(0).max(100).required(),
        currency: Joi.string().allow(null).optional(),
        curShow: Joi.number().integer().min(0),
        betEdited: Joi.number().integer().min(0),
        minBet: Joi.number().min(0),
        maxBet: Joi.number().min(0),
        memo: Joi.string().allow("", null).optional(),
        adminMemo: Joi.string().allow("", null).optional(),
        apiType: Joi.number().integer().min(0),
        siteEndPoint: Joi.string(),
        ipAddress: Joi.string().allow("", null).optional(),
        zeroSetting: Joi.string().allow("", null).optional(),
        blockOppositeBet: Joi.number().integer().min(0),
        blockRedEnvelope: Joi.number().integer().min(0),
        betLimitSkin: Joi.string().default('SKIN1'),
    }),

    update: Joi.object({
        agentName: Joi.string(),
        agentType: Joi.number().integer().min(0),
        apiType: Joi.number().integer().min(0),
        password: Joi.string(),
        percent: Joi.number().min(0).max(100),
        ipAddress: Joi.string().allow("").optional(),
        memo: Joi.string().allow("").optional(),
        adminMemo: Joi.string().allow("").optional(),
        curShow: Joi.number().integer().min(0),
        betEdited: Joi.number().integer().min(0),
        minBet: Joi.number().min(0),
        maxBet: Joi.number().min(0),
        zeroSetting: Joi.string().allow("").optional(),
        siteEndPoint: Joi.string().allow("").optional(),
        status: Joi.number().integer().min(0),
        rtp: Joi.number().min(0).max(100),
        blockOppositeBet: Joi.number().integer().min(0),
        blockRedEnvelope: Joi.number().integer().min(0),
        betLimitSkin: Joi.string().default('SKIN1'),
    }),

    exchange: Joi.object({
        agentId: Joi.number().integer().required(),
        amount: Joi.number().greater(0).required(),
        chargeType: Joi.number().integer().min(0).required(),
    }),

    checkCode: Joi.object({
        agentCode: Joi.string().required(),
    }),

    profile: Joi.object({
        password: Joi.string().required(),
        memo: Joi.string().allow("").optional(),
    }),

    changeRtp: Joi.object({
        rtp: Joi.number().min(0).max(100).required(),
    }),
};

module.exports = schemas;
