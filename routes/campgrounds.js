const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const campgroundModel = require("../models/campgrounds");
const campgroundsController = require("../controllers/campgrounds");
const { isLoggedIn, isAuthor, validateCampground } = require("../middleware");
const multer = require("multer");
const { storage } = require("../cloudinaary");
const upload = multer({ storage });

const mbxGeoCoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapboxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeoCoding({ accessToken: mapboxToken });

router.get("/geocode/:q", async (req, res) => {
  const geoData = await geocoder
    .forwardGeocode({
      query: req.params.q,
      limit: 1,
    })
    .send();

  res.send(geoData.body.features);
});

//temporary to check if it works.
// router.get(
//   "/makenew",
//   catchAsync(async (req, res) => {
//     const c1 = new campgroundModel({
//       title: "My Backyard",
//       description: "Cheap Camping",
//     });
//     await c1.save();
//     res.send(c1);
//   })
// );

//To access all the campgrounds
router.get("/", catchAsync(campgroundsController.index));

//To create new campgrounds
router.get("/new", isLoggedIn, campgroundsController.renderNewForm);

router.post(
  "/new",
  isLoggedIn,
  upload.array("campground[image]"),
  validateCampground,
  catchAsync(campgroundsController.createNewCampground)
);

router.get(
  "/:id/edit",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsController.renderEditForm)
);

//To access individual campgrounds
router.get("/:id", catchAsync(campgroundsController.showCampground));

router.put(
  "/:id",
  isLoggedIn,
  upload.array("campground[image]"),
  validateCampground,
  isAuthor,
  catchAsync(campgroundsController.editCampground)
);
router.delete(
  "/:id",
  isLoggedIn,
  isAuthor,
  catchAsync(campgroundsController.deleteCampground)
);

module.exports = router;
