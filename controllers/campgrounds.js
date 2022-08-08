const { cloudinary } = require("../cloudinaary");
const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({ accessToken: mapboxToken });
const campgroundModel = require("../models/campgrounds");

module.exports.index = async (req, res, next) => {
  const campgrounds = await campgroundModel.find({});
  res.render("campgrounds/index", { campgrounds });
};

module.exports.renderNewForm = (req, res) => {
  res.render("./campgrounds/new");
};

module.exports.createNewCampground = async (req, res, next) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.body.campground.location,
      limit: 1,
    })
    .send();
  // console.log(geoData.body.features);
  // res.send('OK');
  const camp = new campgroundModel(req.body.campground);
  camp.geometry = geoData.body.features[0].geometry;
  //because req.files is an array
  camp.images = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.author = req.user._id;
  await camp.save();
  console.log(camp);
  req.flash("success", "New Campground Created!");
  //console.log(camp._id);
  res.redirect(`/campgrounds/${camp._id}`);
};

module.exports.renderEditForm = async (req, res) => {
  let camp = await campgroundModel.findById(req.params.id);
  res.render("campgrounds/edit", { camp });
};

module.exports.showCampground = async (req, res) => {
  const camp = await campgroundModel
    .findById(req.params.id)
    .populate({ path: "reviews", populate: { path: "author" } })
    .populate("author");
  //console.log(camp);
  if (!camp) {
    req.flash("error", "Cannot find that campground");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};

module.exports.editCampground = async (req, res, next) => {
  const { id } = req.params;
  let camp = await campgroundModel.findByIdAndUpdate(id, {
    ...req.body.campground,
  });
  const imgs = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.images.push(...imgs);
  // console.log("Before _______________", camp);
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    let x = await camp.updateOne({
      $pull: { images: { filename: { $in: req.body.deleteImages } } },
    });
    // console.log("After _______________", camp);
  }
  await camp.save();
  console.log("req.body _______________", req.body);
  req.flash("success", `${req.body.campground.title} Updated!`);
  res.redirect(`/campgrounds/${id}`);
};

module.exports.deleteCampground = async (req, res) => {
  const { id } = req.params;
  await campgroundModel.findByIdAndDelete(id);
  req.flash("success", `Successfully deleted!`);
  res.redirect("/campgrounds");
};
