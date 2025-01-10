const axios = require("axios");
const { Agent, AgentLoginHistory } = require("../../models");
const { ERR_MSG } = require("../../utils/constants");
const logger = require("../../utils/logger");

exports.login = async (req, res) => {
    try {
        const { agentCode, password } = req.body;

        const agent = await Agent.findOne({
            where: { agentCode },
            include: [
                {
                    model: Agent,
                    as: "parent",
                    attributes: ["agentCode"],
                },
            ],
        });
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        if (password != agent.password) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INCORRECT_PASSWORD,
            });
        }

        if (agent.status == 1) {
            req.session.auth = {
                ...agent.dataValues,
                password: undefined,
                parentCode: agent.parent ? agent.parent.agentCode : "",
            };

            let ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress;
            let ipRes = {};

            for (let i = 0; i < 10; ++i) {
                ipRes = await axios.get(`https://ipinfo.io/${ip}/json`);
                if (ipRes.status == 200) {
                    break;
                }
            }

            ipRes.data ? 0 : ipRes.data = {};
            AgentLoginHistory.create({
                agentCode,
                agentName: agent.agentName,
                ip,
                country: ipRes.data.country || "",
                region: ipRes.data.region || "",
                city: ipRes.data.city || "",
                loc: ipRes.data.loc || "",
                org: ipRes.data.org || "",
                postal: ipRes.data.postal || ""
            });

            let redirectUrl = "";
            if (agent.role == 100) {
                redirectUrl = "/app/agents";
            } else {
                redirectUrl = "/app/dashboard";
            }

            return res.json({
                status: 1,
                redirectUrl,
            });
        } else {
            return res.json({
                status: 0,
                msg: ERR_MSG.BLOCKED_AGENT,
            });
        }
    } catch (error) {
        logger("error", "API | Auth | Login", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.logout = async (req, res) => {
    try {
        req.session.destroy();

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Auth | Logout", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
