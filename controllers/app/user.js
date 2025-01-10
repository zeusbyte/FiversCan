const { Agent } = require("../../models");
const { Op } = require("sequelize");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");

exports.users = async (req, res) => {
    return res.render("user/users", {
        session: req.session,
    });
};

exports.userExchangeHistory = async (req, res) => {
    return res.render("user/userExchangeHistory", {
        session: req.session,
    });
};

exports.userBalanceHistory = async (req, res) => {
    return res.render("user/userBalanceHistory", {
        session: req.session,
    });
};

exports.slotGameTransaction = async (req, res) => {
    return res.render("user/slotGameTransaction", {
        session: req.session,
    });
};

exports.liveGameTransaction = async (req, res) => {
    return res.render("user/liveGameTransaction", {
        session: req.session,
    });
};