const { ERR_MSG } = require("../utils/constants");

exports.requireApiAuth = (req, res, next) => {
    const whiteList = ["/api/auth/login", "/api/auth/logout", "/api/alive"];

    if (whiteList.indexOf(req.originalUrl) == -1) {
        if (!req.session.auth) {
            return res.json({
                status: 0,
                msg: ERR_MSG.UNAUTHORIZED,
            });
        }
    }

    next();
};

exports.requireAppAuth = (req, res, next) => {
    const whiteList = ["/app/login"];

    if (whiteList.indexOf(req.originalUrl) == -1) {
        if (!req.session.auth) {
            return res.redirect("/app/login");
        }
    }

    next();
};
