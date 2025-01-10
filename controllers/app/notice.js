exports.message = async (req, res) => {
    return res.render("notice/message", {
        session: req.session,
    });
};

exports.checkup = async (req, res) => {
    return res.render("notice/checkup", {
        session: req.session,
    });
};

exports.popup = async (req, res) => {
    return res.render("notice/popup", {
        session: req.session,
    });
};
