const logger = require("../utils/logger");

module.exports = async ({ app }) => {
    // database
    await require("./database")();
    logger("info", "Loaded", "Database config");

    // express
    await require("./express")({ app });
    logger("info", "Loaded", "Express config");
};
