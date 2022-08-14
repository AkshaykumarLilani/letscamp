//This Seeds folder is a way to populate our database with some data wo that we have something to work with,

const mongoose = require("mongoose");
const campgroundModel = require("../models/campgrounds");
const cities = require("./cities");
const { places, descriptors } = require("./seedHelpers");

mongoose.connect("mongodb://localhost:27017/lets-camp");
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database Connected");
});

//an easy way to access a random element from a given array
const sample = (array) => array[Math.floor(Math.random() * array.length)];

const seedDb = async () => {
  await campgroundModel.deleteMany({});
  for (let i = 0; i < 50; i++) {
    const random1000 = Math.floor(Math.random() * 1000);
    const price = Math.floor(Math.random() * 20) + 10;
    const camp = new campgroundModel({
      author: "62dede0923abd7a51390abb4",
      location: `${cities[random1000].city}, ${cities[random1000].state}`,
      title: `${sample(descriptors)} ${sample(places)}`,
      geometry: {
        type: "Point",
        coordinates: [
          cities[random1000].longitude,
          cities[random1000].latitude,
        ],
      },
      description:
        "Lorem ipsum dolor sit amet consectetur adipisicing elit. Corrupti facere voluptatum sed maiores laudantium magni ducimus incidunt, nostrum natus architecto aspernatur consequuntur odit voluptates veritatis ex eius perferendis itaque quis!",
      price,
      images: [
        {
          url: "https://res.cloudinary.com/dnl8zm7fi/image/upload/v1659378200/LetsCamp/bxye1zggsvxhjugfujpj.jpg",
          filename: "LetsCamp/bxye1zggsvxhjugfujpj",
        },
        {
          url: "https://res.cloudinary.com/dnl8zm7fi/image/upload/v1659378202/LetsCamp/hbkmzvhpdnkdubwt0z7o.jpg",
          filename: "LetsCamp/hbkmzvhpdnkdubwt0z7o",
        },
      ],
    });
    await camp.save();
  }
};
seedDb().then(() => {
  mongoose.connection.close();
  console.log("Connection closed");
});
