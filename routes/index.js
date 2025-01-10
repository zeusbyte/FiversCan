const express = require("express");

const router = express.Router();

// routers
const apiRouter = require("./api");
const appRouter = require("./app");

// middlewares
const setLocale = require("../middlewares/locale");
const { requireApiAuth, requireAppAuth } = require("../middlewares/auth");

router.get("/", (req, res) => {
    let redirectUrl;

    if (req.session.auth) {
        if (req.session.auth.role == 100) {
            redirectUrl = "/app/agents";
        } else {
            redirectUrl = "/app/dashboard";
        }
    } else {
        redirectUrl = "/app/login";
    }

    return res.redirect(redirectUrl);
});

router.use("/api", requireApiAuth, apiRouter);
router.use("/app", [requireAppAuth, setLocale], appRouter);

module.exports = router;
