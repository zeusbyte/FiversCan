const Joi = require("joi");

const schemas = {
    create: Joi.object({
        messageTitle: Joi.string().required(),
        messageContent: Joi.string().required(),
    }),
    answer: Joi.object({
        answerContent: Joi.string().required(),
    }),
};

module.exports = schemas;
