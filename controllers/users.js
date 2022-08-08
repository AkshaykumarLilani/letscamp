const User = require("../models/user");

module.exports.renderRegisterForm = (req, res) => {
  res.render("auth/register");
};

module.exports.renderLoginForm = (req, res) => {
  res.render("auth/login");
};

module.exports.loginUser = (req, res) => {
  req.flash("success", "Welcome Back!");
  let redirectUrl = "/campgrounds";
  console.log("req.session.returnTo ", req.session.returnTo);
  if (req.session.returnTo) {
    redirectUrl = req.session.returnTo;
  }
  delete req.session.returnTo;
  //console.log("redirectUrl", redirectUrl);
  res.redirect(redirectUrl);
};

module.exports.registerUser = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const user = new User({ username, email });
    const newUser = await User.register(user, password);
    console.log(newUser);
    req.login(newUser, (err) => {
      if (err) return next(err);
      req.flash("success", "Welcome to Yelp Camp!");
      res.redirect("/campgrounds");
    });
  } catch (e) {
    req.flash("error", e.message);
    res.redirect("/register");
  }
};
module.exports.logoutUser = function (req, res, next) {
  req.logout();
  req.flash("success", "Logged you out");
  res.redirect("/");
};
