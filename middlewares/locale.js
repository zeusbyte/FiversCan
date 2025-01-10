const { Agent } = require("../models");
const logger = require("../utils/logger");
const { ERR_MSG } = require("../utils/constants");

const setLocale = async (req, res, next) => {
    try {
        if (req.originalUrl != "/app/login") {
            let locale = "en";

            // if (req.session.locale) {
            //     locale = req.session.locale;
            // } else {
            //     if (req.session.auth) {
            //         const agent = await Agent.findByPk(req.session.auth.id);
            //         if (agent) {
            //             locale = agent.lang;
            //         }
            //     }
            //     req.session.locale = locale;
            // }

            req.setLocale(locale);
        }

        next();
    } catch (error) {
        logger("error", "I18n", error.message, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

module.exports = setLocale;
