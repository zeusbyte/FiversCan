exports.agents = async (req, res) => {
    return res.render("agent/agents", {
        session: req.session,
    });
};

exports.agentExchangeHistory = async (req, res) => {
    return res.render("agent/agentExchangeHistory", {
        session: req.session,
    });
};

exports.agentBalanceHistory = async (req, res) => {
    return res.render("agent/agentBalanceHistory", {
        session: req.session,
    });
};
