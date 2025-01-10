const moment = require("moment");
const { createLogger, format, transports } = require("winston");
const { combine, timestamp, printf } = format;
const isEmpty = require("../utils/isEmpty");
require("winston-daily-rotate-file");

const baseLogger = createLogger({
    format: combine(
        timestamp(),
        printf(({ level, message, timestamp }) => `${moment(timestamp).format("YYYY-MM-DD HH:mm:ss")} ${level}: ${message}`)
    ),
    transports: [
        new transports.Console({ json: true }),
        new transports.DailyRotateFile({
            filename: "logs/%DATE%.log",
            datePattern: "YYYY-MM-DD",
            json: true,
            maxFiles: "30d",
        }),
    ],
    exitOnError: false,
});

const logger = (level, comment, message, req = null) => {
    if (message.length > 200) {
        message = message.slice(0, 200) + " ... ";
    }

    if (isEmpty(req)) {
        baseLogger[level](`[ ${comment} ]: ${message}`);
    } else {
        let agentCode = null;

        if (req.session.auth) {
            agentCode = req.session.auth.agentCode;
        }

        baseLogger[level](`[ ${comment} ]: (${agentCode})  ${message}`);
    }
};

module.exports = logger;
