exports.provider = async (req, res) => {
    return res.render("provider/providers", {
        session: req.session,
    });
};