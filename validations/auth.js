const Joi = require("joi");

const schemas = {
    login: Joi.object({
        agentCode: Joi.string().required(),
        password: Joi.string().required(),
    }),
};

module.exports = schemas;
