const campgroundModel = require("./models/campgrounds");
const reviewModel = require("./models/review");
const { joiCampgroundSchema, joiReviewSchema } = require("./schemas.js");
const ExpressError = require("./utils/ExpressError");

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "you must be logged in!");
    return res.redirect("/login");
  }
  next();
};

module.exports.isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const campground = await campgroundModel.findById(id);
  if (!campground.author.equals(req.user._id)) {
    // console.log("campground.author._id: ", campground.author._id);
    // console.log("req.user_id: ", req.user_id);
    req.flash("error", "You are not authorized to do this!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.validateCampground = (req, res, next) => {
  const { error } = joiCampgroundSchema.validate(req.body);
  // console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateReview = (req, res, next) => {
  //console.log("In validateReview");
  //console.log(req.body);
  const { error } = joiReviewSchema.validate(req.body);
  //console.log(error);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await reviewModel.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    // console.log("campground.author._id: ", campground.author._id);
    // console.log("req.user_id: ", req.user_id);
    req.flash("error", "You are not authorized to do this!");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};

module.exports.addDemoUser = (req, res, next) => {
  req.body.username = "demo";
  req.body.password = "demo";
  next();
};
