exports.login = async (req, res) => {
    if (req.session.auth) {
        return res.redirect("/app/dashboard");
    } else {
        return res.render("auth/login.ejs");
    }
};
