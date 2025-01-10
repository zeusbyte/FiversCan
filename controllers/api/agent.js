const MD5 = require("md5.js");
const { Op } = require("sequelize");
const { Agent, User, Currency, AgentTransaction, AgentBalanceProgress } = require("../../models");
const logger = require("../../utils/logger");
const { ERR_MSG } = require("../../utils/constants");
const isEmpty = require("../../utils/isEmpty");

exports.createAgent = async (req, res) => {
    try {
        const { parentId, agentCode, agentName, agentType, password, percent, currency, curShow, memo, apiType, siteEndPoint, ipAddress, betEdited, minBet, maxBet, zeroSetting, adminMemo, blockOppositeBet, blockRedEnvelope, betLimitSkin } = req.body;

        const existAgent = await Agent.findOne({ where: { agentCode } });
        if (existAgent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.DUPLICATED_AGENT,
            });
        }

        const parentAgent = await Agent.findOne({ where: { id: parentId } });
        if (!parentAgent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PARENT_AGENT,
            });
        }

        if (parentAgent.agentType == 2) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PARENT_AGENT_TYPE,
            });
        }

        const token = new MD5().update(agentCode + password + new Date()).digest("hex");
        const secretKey = new MD5().update(agentCode + password + "secret-key" + new Date()).digest("hex");

        const parentPath = parentAgent.parentPath + parentAgent.id + ".";
        const depth = Number(parentAgent.depth) + 1;
        const lang = parentAgent.lang;

        await Agent.create({
            parentId,
            agentName,
            agentCode,
            agentType,
            password,
            percent,
            memo,
            zeroSetting,
            apiType,
            siteEndPoint,
            token,
            secretKey,
            depth,
            ipAddress,
            parentPath,
            adminMemo,
            lang,
            currency: parentAgent.role == 1 ? currency : parentAgent.currency,
            curShow,
            betEdited,
            minBet,
            maxBet,
            blockOppositeBet,
            blockRedEnvelope,
            betLimitSkin
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Create Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.updateAgent = async (req, res) => {
    try {
        const { id } = req.params;
        const { agentName, password, agentType, apiType, percent, ipAddress, memo, status, siteEndPoint, curShow, betEdited, minBet, maxBet, zeroSetting, rtp, adminMemo, blockOppositeBet, blockRedEnvelope, betLimitSkin } = req.body;

        const agent = await Agent.findByPk(id);
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        let updateData = {};
        if (!isEmpty(agentName) || agentName == "") updateData.agentName = agentName;
        if (!isEmpty(agentType)) updateData.agentType = agentType;
        if (!isEmpty(apiType)) updateData.apiType = apiType;
        if (!isEmpty(password)) updateData.password = password;
        if (!isEmpty(percent)) updateData.percent = percent;
        if (!isEmpty(status)) updateData.status = status;
        if (!isEmpty(siteEndPoint)) updateData.siteEndPoint = siteEndPoint;
        if (!isEmpty(ipAddress)) updateData.ipAddress = ipAddress;
        if (!isEmpty(zeroSetting) || zeroSetting == "") updateData.zeroSetting = zeroSetting;
        if (!isEmpty(curShow)) updateData.curShow = curShow;
        if (!isEmpty(betEdited)) updateData.betEdited = betEdited;
        if (!isEmpty(minBet)) updateData.minBet = minBet;
        if (!isEmpty(maxBet)) updateData.maxBet = maxBet;
        if (!isEmpty(rtp)) updateData.rtp = rtp;
        if (!isEmpty(memo) || memo == "") updateData.memo = memo;
        if (!isEmpty(adminMemo) || adminMemo == "") updateData.adminMemo = adminMemo;
        if (!isEmpty(blockOppositeBet)) updateData.blockOppositeBet = blockOppositeBet;
        if (!isEmpty(blockRedEnvelope)) updateData.blockRedEnvelope = blockRedEnvelope;
        if (!isEmpty(betLimitSkin)) updateData.betLimitSkin = betLimitSkin;

        if (agent.zeroSetting != zeroSetting) {
            updateData.curIndex = 0;
            updateData.zeroArray = "";
        }

        const userCount = await User.count({ where: { agentCode: agent.agentCode } });

        if (!isEmpty(apiType) && agent.apiType != apiType && userCount > 0) {
            return res.json({
                status: 0,
                msg: ERR_MSG.CANNOT_UPDATE_AGENT,
            });
        }

        await Agent.update(updateData, { where: { id } });

        if (!isEmpty(status)) {
            await Agent.update(
                { status },
                {
                    where: {
                        parentPath: { [Op.like]: `${agent.parentPath}${agent.id}.%` },
                        status: { [Op.not]: 2 },
                    },
                }
            );
        }

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Update Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAgentById = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await Agent.findOne({
            where: { id },
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

        return res.json({
            status: 1,
            agent,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Agent By ID", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.deleteAgent = async (req, res) => {
    try {
        const { id } = req.params;

        const agent = await Agent.findByPk(id);
        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        await Agent.update(
            { status: 2 },
            {
                where: {
                    [Op.or]: [{ parentPath: { [Op.like]: `${agent.parentPath}${agent.id}.%` } }, { id }],
                },
            }
        );
        await User.update(
            { status: 2 },
            {
                where: { parentPath: { [Op.like]: `${agent.parentPath}${agent.id}.%` } },
            }
        );

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Delete Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.exchangeAgent = async (req, res) => {
    try {
        const { agentId, chargeType } = req.body;
        const amount = Number(req.body.amount);

        const agent = await Agent.findOne({
            where: { id: agentId, status: { [Op.not]: 2 } },
        });

        if (!agent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_AGENT,
            });
        }

        const parentAgent = await Agent.findOne({
            where: { id: agent.parentId, status: { [Op.not]: 2 } },
        });

        if (!parentAgent) {
            return res.json({
                status: 0,
                msg: ERR_MSG.INVALID_PARENT_AGENT,
            });
        }

        let parentBeforeBalance = Number(parentAgent.balance);
        let agentBeforeBalance = Number(agent.balance);

        let parentAfterBalance;
        let agentAfterBalance;

        if (chargeType == 1) {
            // 충전

            if (parentBeforeBalance < amount) {
                return res.json({
                    status: 0,
                    msg: ERR_MSG.INSUFFICIENT_PARENT_FUNDS,
                });
            }

            parentAfterBalance = parentBeforeBalance - amount;
            agentAfterBalance = agentBeforeBalance + amount;
        } else {
            // 환전

            if (agentBeforeBalance < amount) {
                return res.json({
                    status: 0,
                    msg: ERR_MSG.INSUFFICIENT_AGENT_FUNDS,
                });
            }

            parentAfterBalance = parentBeforeBalance + amount;
            agentAfterBalance = agentBeforeBalance - amount;
        }

        await parentAgent.update({ balance: parentAfterBalance });
        await agent.update({ balance: agentAfterBalance });

        AgentBalanceProgress.create({
            agentCode: agent.agentCode,
            agentBalance: parentAfterBalance,
            comment: `[Agent ${chargeType == 1 ? "Deposit" : "Withdraw"}] (${parentAgent.agentCode}): ${amount}`,
            parentPath: agent.parentPath,
        });

        AgentTransaction.create({
            parentCode: parentAgent.agentCode,
            agentCode: agent.agentCode,
            chargeType: chargeType,
            chargeAmount: amount,
            parentPrevBalance: parentBeforeBalance,
            parentAfterBalance: parentAfterBalance,
            agentPrevBalance: agentBeforeBalance,
            agentAfterBalance: agentAfterBalance,
            status: 1,
            parentPath: agent.parentPath,
        });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Exchange Agent", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getParentAgents = async (req, res) => {
    try {
        const { id } = req.params;

        let agentId = id;
        let parentAgents = [];
        let limitId = req.session.auth.id;

        if (req.session.auth.role == 100) {
            const admin = await Agent.findOne({ where: { role: 1 } });
            limitId = admin.id;
        }

        while (true) {
            const agent = await Agent.findByPk(agentId);

            if (agent != null && agent.id == limitId) {
                parentAgents.push(agent);
                break;
            } else {
                parentAgents.push(agent);
                agentId = agent.parentId;
                continue;
            }
        }

        return res.json({
            status: 1,
            parent: parentAgents,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Parent Agents", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getChildAgents = async (req, res) => {
    try {
        const { id } = req.params;

        let childAgents = [];

        const agent = await Agent.findByPk(id);

        childAgents = await Agent.findAll({
            where: {
                parentPath: { [Op.like]: `${agent.parentPath}${agent.id}.%` },
                status: { [Op.not]: 2 },
            },
            order: ["parentPath"],
        });
        childAgents.unshift(agent);

        return res.json({
            status: 1,
            child: childAgents,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Child Agents", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.checkAgentCode = async (req, res) => {
    try {
        const agent = await Agent.findOne({ where: { agentCode: req.body.agentCode } });

        if (agent) {
            return res.json({
                status: 1,
                result: 0,
            });
        } else {
            return res.json({
                status: 1,
                result: 1,
            });
        }
    } catch (error) {
        logger("error", "API | Agent | Check Agent Code", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.updateProfile = async (req, res) => {
    try {
        const { password, memo } = req.body;

        await Agent.update({ password, memo }, { where: { id: req.session.auth.id } });

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Update Profile", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getAgentsByTree = async (req, res) => {
    try {
        const { search } = req.query;

        let agents = [];
        let limitId = req.session.auth.id;

        if (req.session.auth.role == 100) {
            const admin = await Agent.findOne({ where: { role: 1 } });
            limitId = admin.id;
        }

        const getChild = async (root, id) => {
            const children = await Agent.findAll({
                where: {
                    parentId: id,
                    role: { [Op.not]: 1 },
                    status: { [Op.not]: 2 },
                    [Op.or]: [{ agentCode: { [Op.substring]: search } }, { agentName: { [Op.substring]: search } }],
                },
            });

            if (children.length > 0) {
                for (const i in children) {
                    const childAgentBalanceSum = await Agent.sum("balance", { where: { parentPath: { [Op.substring]: `.${children[i].id}.` } } });
                    const childUserBalanceSum = await User.sum("balance", { where: { parentPath: { [Op.substring]: `.${children[i].id}.` }, apiType: 1 } });

                    root[i] = {
                        ...children[i].dataValues,
                        childAgentBalanceSum,
                        childUserBalanceSum,
                        children: [],
                    };

                    await getChild(root[i].children, children[i].id);
                }
            }
        };

        await getChild(agents, limitId);

        for (let i = 0; i < agents.length; i++) {
            if (agents[i].parentId == 1) {
                agents[i].parentId = agents[i].id;
            }
        }

        return res.json({
            status: 1,
            agents,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Agents By Tree", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getChildMaxDepth = async (req, res) => {
    try {
        let depth;
        let agentId = req.session.auth.id;

        if (req.session.auth.role == 100) {
            const admin = await Agent.findOne({ where: { role: 1 } });
            agentId = admin.id;
        }

        depth = await Agent.max("depth", {
            where: {
                [Op.or]: [
                    {
                        parentPath: { [Op.substring]: `.${agentId}.` },
                    },
                    { id: agentId },
                ],
            },
        });

        return res.json({
            status: 1,
            depth,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Child Max Depth", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.changeRtp = async (req, res) => {
    try {
        const agent = await Agent.findByPk(req.session.auth.id);
        if (!agent) {
            return res.json({
                status: 0,
                msg: INVALID_AGENT,
            });
        }

        const rtp = req.body.rtp;

        await agent.update({ rtp });
        req.session.auth.rtp = rtp;

        return res.json({ status: 1 });
    } catch (error) {
        logger("error", "API | Agent | Change Rtp", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.changeLanguage = async (req, res) => {
    try {
        const { locale } = req.params;

        const agent = await Agent.findByPk(req.session.auth.id);

        if (agent) {
            agent.update({ lang: locale });
        }

        req.session.locale = locale;

        // redirect to url before call this api
        if (req.headers.referer) {
            return res.redirect(req.headers.referer);
        } else {
            return res.redirect("/");
        }
    } catch (error) {
        logger("error", "API | Agent | Set Lang", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};

exports.getCurrencies = async (req, res) => {
    try {
        const currencies = await Currency.findAll();
        return res.json({
            status: 1,
            currencies,
        });
    } catch (error) {
        logger("error", "API | Agent | Get Currencies", `${error.message}`, req);

        return res.json({
            status: 0,
            msg: ERR_MSG.INTERNAL_ERROR,
        });
    }
};
