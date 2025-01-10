const dotenv = require("dotenv");

dotenv.config();

module.exports = {
    port: process.env.PORT || 5006,
    secretKey: process.env.SECRET_KEY || "secretKey",

    masterCode: process.env.MASTER_CODE,

    database: {
        type: process.env.DB_TYPE,
        host: process.env.DB_HOST,
        name: process.env.DB_NAME,
        user: process.env.DB_USER,
        port: parseInt(process.env.DB_PORT),
        pass: process.env.DB_PASS,
        logging: process.env.DB_LOGGING === "true" ? true : false,
        timezone: process.env.DB_TIMEZONE || "+00:00",
    },

    manage: {
        cryptKey: process.env.CRYPT_KEY || "cryptKey",
    },

    call: {
        range: parseInt(process.env.CALL_RANGE) || 5,
    },

    aasEndpoint: process.env.AAS_ENDPOINT,
};
