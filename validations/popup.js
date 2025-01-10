const Joi = require("joi");

const schemas = {
    create: Joi.object({
        content: Joi.string().required(),
    }),
};

module.exports = schemas;
