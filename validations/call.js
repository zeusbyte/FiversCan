const Joi = require("joi");

const schemas = {
    getPlayers: Joi.object({}),
    getCallList: Joi.object({
        providerCode: Joi.string().required(),
        gameCode: Joi.string().required(),
    }),
    applyCall: Joi.object({
        agentCode: Joi.string().required(),
        userCode: Joi.string().required(),
        providerCode: Joi.string().required(),
        gameCode: Joi.string().required(),
        callRtp: Joi.number().greater(0).required(),
        callWin: Joi.number().greater(0).required(),
        callType: Joi.number().integer().valid(1, 2).required(),
    }),
    cancelCall: Joi.object({
        agentCode: Joi.string().required(),
        callId: Joi.number().integer().required(),
    }),
    controlRtp: Joi.object({
        agentCode: Joi.string().required(),
        userCode: Joi.string().required(),
        providerCode: Joi.string().required(),
        rtp: Joi.number().min(0).max(100).required(),
    }),
};

module.exports = schemas;
