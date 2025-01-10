const express = require("express");
const loaders = require("./loaders");
const config = require("./config/main");
const logger = require("./utils/logger");

const startServer = async () => {
    const app = express();

    await loaders({ app });

    app.listen(config.port, () => {
        logger("info", "Server", `Server is started on ${config.port} port`);
    });
};

startServer();
