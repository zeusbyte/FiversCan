const bodyParser = require("body-parser");
const cors = require("cors");
const compression = require("compression");
const path = require("path");
const express = require("express");
const session = require("express-session");
const MySQLStore = require("express-mysql-session");
const cookieParser = require("cookie-parser");
const i18n = require("i18n");
const config = require("../config/main");
const router = require("../routes");
const logger = require("../utils/logger");

module.exports = ({ app }) => {
    try {
        // static public
        app.use(express.static(path.join(__dirname, "../public")));

        // middlewares
        app.use(cors({ origin: "*" }));
        app.use(bodyParser.json({ limit: "10mb" }));
        app.use(bodyParser.urlencoded({ limit: "10mb", extended: false }));
        app.use(compression());
        app.use(cookieParser());

        // i18n
        i18n.configure({
            locales: ["en", "ko"],
            directory: path.join(__dirname, "../lang"),
        });

        app.use(i18n.init);

        // session
        const sessionStore = new MySQLStore({
            host: config.database.host,
            port: config.database.port,
            user: config.database.user,
            password: config.database.pass,
            database: config.database.name,
            expiration: 1000 * 60 * 30,
            clearExpired: true,
            clearExpirationInterval: 5000,
        });

        app.use(
            session({
                key: "_gid",
                cookie: {
                    path: "/",
                    httpOnly: true,
                },
                secret: config.secretKey,
                resave: false,
                saveUninitialized: false,
                store: sessionStore,
            })
        );

        // main router
        app.use("/", router);

        // ejs engine
        app.set("views", path.join(__dirname, "../views"));
        app.set("view engine", "ejs");
        app.engine("html", require("ejs").renderFile);
    } catch (error) {
        logger("error", "Express", `Express config failed... ${error.message}`);
        process.exit(0);
    }
};
