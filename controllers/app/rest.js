const moment = require("moment");
const { Op } = require("sequelize");
const { Agent, Popup, User, Player, AgentBalanceHistory } = require("../../models");
const logger = require("../../utils/logger");
const config = require("../../config/main");
const { ERR_MSG } = require("../../utils/constants");

exports.dashboard = async (req, res) => {
    try {
        // popups
        const popup = await Popup.findAndCountAll({ where: { status: 0 } });

        let popups = popup.rows.map((item) => ({
            id: item.id,
            content: item.content,
            createdAt: moment(item.createdAt).format("YYYY-MM-DD HH:mm:ss"),
        }));

        const agent = await Agent.findByPk(req.session.auth.id);

        // details
        let userCount = 0;
        let childAgentCount = 0;
        let childUserCount = 0;
        let playerCount = 0;

        userCount = await User.count({ where: { agentCode: agent.agentCode } });
        childAgentCount = await Agent.count({ where: { parentPath: { [Op.substring]: `.${agent.id}.` } } });
        childUserCount = await User.count({
            where: {
                parentPath: { [Op.substring]: `.${agent.id}.` },
                agentCode: { [Op.not]: agent.agentCode },
            },
        });

        playerCount = await Player.count({
            where: {
                agentCode: agent.agentCode,
                status: "PLAYING",
                updatedAt: { [Op.between]: [new Date(new Date() - 1000 * 60 * 15), new Date()] },
            },
        });

        const today = new Date();
        const startTime = new Date(today.setHours(0, 0, 0));
        const endTime = new Date(today.setHours(24, 0, 0));

        const balanceHistories = await AgentBalanceHistory.findAll({
            where: { agentCode: agent.agentCode, createdAt: { [Op.between]: [startTime, endTime] } },
        });

        const agentBalance = await Agent.findOne({
            where: { agentCode: agent.agentCode, status: 1 },
        });

        const ownUserBalances = await User.sum("balance", {
            where: { agentCode: agent.agentCode, apiType: 1 },
        });

        const hubAgentBalances = await Agent.sum("balance", {
            where: { parentPath: { [Op.substring]: `.${agent.id}.` } },
        });

        const hubUserBalances = await User.sum("balance", {
            where: {
                parentPath: { [Op.substring]: `.${agent.id}.` },
                apiType: 1,
                agentCode: { [Op.not]: agent.agentCode },
            },
        });

        const balances = {
            agentBalance: agentBalance.balance,
            ownUserBalances,
            hubAgentBalances,
            hubUserBalances,
        };

        return res.render("rest/dashboard", {
            session: req.session,
            popups: popups,
            details: {
                userCount,
                childUserCount,
                childAgentCount,
                playerCount,
                balanceHistories,
            },
            balances,
        });
    } catch (error) {
        logger("error", "App | Dashboard", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.notFound = async (req, res) => {
    return res.render("rest/404");
};

exports.docs = async (req, res) => {
    return res.render("rest/docs", {
        session: req.session,
        aasEndpoint: config.aasEndpoint,
    });
};


exports.profile = async (req, res) => {
    return res.render("rest/profile", {
        session: req.session,
    });
};
