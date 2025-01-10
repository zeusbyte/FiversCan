const Joi = require("joi");

const schemas = {
    update: Joi.object({
        status: Joi.number().integer().min(0).required(),
    }),
    changeRtp: Joi.object({
        method: Joi.string().valid("user", "agent").required(),
        code: Joi.string().required(),
        rtp: Joi.number().min(0).max(100).required(),
    }),
    exchange: Joi.object({
        chargeType: Joi.number().integer().min(0).required(),
        userCode: Joi.string().required(),
        amount: Joi.number().greater(0).required(),
    }),
};

module.exports = schemas;
