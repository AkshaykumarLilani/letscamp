const Review = require("../models/review");
const campgroundModel = require("../models/campgrounds");

module.exports.createReview = async (req, res) => {
  const camp = await campgroundModel.findById(req.params.id);
  //console.log(`__________________\n${camp}`);
  const review = new Review(req.body.review);
  review.author = req.user._id;
  //console.log(`__________________\n${review}`);
  camp.reviews.push(review);
  await camp.save();
  await review.save();

  req.flash("success", `New Review added`);
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.deleteReview = async (req, res) => {
  const { id, reviewId } = req.params;
  await campgroundModel.findByIdAndUpdate(id, {
    $pull: { reviews: reviewId },
  });
  await Review.findByIdAndDelete(reviewId);
  req.flash("success", `Successfully deleted!`);
  res.redirect(`/campgrounds/${id}`);
};
