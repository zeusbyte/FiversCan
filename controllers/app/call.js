exports.call = async (req, res) => {
    return res.render("call/calls", {
        session: req.session,
    });
};

exports.callHistory = async (req, res) => {
    return res.render("call/callHistory", {
        session: req.session,
    });
};

exports.controlRtp = async (req, res) => {
    return res.render("call/rtp", {
        session: req.session,
    });
};
