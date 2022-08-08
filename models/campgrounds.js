const { string } = require("joi");
const mongoose = require("mongoose");
const Review = require("./review");

//res.cloudinary.com/dnl8zm7fi/image/upload/v1659378089/LetsCamp/kpgfb2oif98sdrlvqzrk.jpg

const ImageSchema = new mongoose.Schema({
  url: String,
  filename: String,
});
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});

//following  opts variable is to enable virtual properties to be stringified, without this virtual properties are not stringified
const opts = { toJSON: { virtuals: true } };

//geometry is stored that way because Mongo supports geo coding and
//it has specified in docs to store geocodes in that way so that we
//can use other special operators by mongo ( which are solely for
//geo coding data work). This format is standard called as GeoJSON.
const campgroundSchema = new mongoose.Schema(
  {
    title: String,
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    images: [ImageSchema],
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  opts
);
campgroundSchema.virtual("properties.popUpMarkup").get(function () {
  return `<strong><a href="/campgrounds/${this._id}">${this.title}</a></strong>
  <p>${this.description.substring(0, 27)}...</p>`;
});

campgroundSchema.post("findOneAndDelete", async (doc) => {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});

module.exports = mongoose.model("Campground", campgroundSchema);
