const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const passportLocalMongoose = require("passport-local-mongoose");

const userSchema = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
});

//following adds username and password to our schema and gives us many more methods
userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model("User", userSchema);
