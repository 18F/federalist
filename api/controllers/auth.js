const passport = require("../services/passport")

const AuthController = {
  logout: function (req, res) {
    passport.logout(req, res)
  },

  github: function (req, res) {
    passport.authenticate("github")(req, res, req.next)
  },

  callback: function (req, res) {
    passport.callback(req, res)
  },
};

module.exports = AuthController;
