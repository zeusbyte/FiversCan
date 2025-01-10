const Joi = require("joi");

const schemas = {
    create: Joi.object({
        startTime: Joi.date().required(),
        endTime: Joi.date().required(),
        content: Joi.string().required(),
    }),
};

module.exports = schemas;
