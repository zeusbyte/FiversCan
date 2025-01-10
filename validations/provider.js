const Joi = require("joi");

const schemas = {
    create: Joi.object({
        providerCode: Joi.string().required(),
        providerName: Joi.string().required(),
        providerEndpoint: Joi.string().required(),
        providerType: Joi.string().required(),
    }),
    update: Joi.object({
        providerCode: Joi.string().required(),
        providerName: Joi.string().required(),
        providerEndpoint: Joi.string().required(),
        providerType: Joi.string().required(),
    }),
    setStatus: Joi.object({
        status: Joi.number().integer().valid(0, 1).required(),
    }),
};

module.exports = schemas;
