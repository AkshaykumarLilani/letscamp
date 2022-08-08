if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const ExpressError = require("./utils/ExpressError");
const flash = require("connect-flash");
const campgroundRoutes = require("./routes/campgrounds");
const reviewRoutes = require("./routes/reviews");
const userRoutes = require("./routes/users");
const passport = require("passport");
const passportLocal = require("passport-local");
const User = require("./models/user");
const multer = require("multer");
const mongooseSanitize = require("express-mongo-sanitize");
const helmet = require("helmet");

const session = require("express-session");
const MongoStore = require("connect-mongo");

const express = require("express");
const app = express();
const methodOverride = require("method-override");
const path = require("path");
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "ejs");
const ejsMate = require("ejs-mate");
app.engine("ejs", ejsMate);
app.use(express.static("public"));
app.use(mongooseSanitize());
app.use(helmet());

const scriptSrcUrls = [
  "https://stackpath.bootstrapcdn.com/",
  "https://api.tiles.mapbox.com/",
  "https://api.mapbox.com/",
  "https://kit.fontawesome.com/",
  "https://cdnjs.cloudflare.com/",
  "https://cdn.jsdelivr.net",
];
//This is the array that needs added to
const styleSrcUrls = [
  "https://kit-free.fontawesome.com/",
  "https://api.mapbox.com/",
  "https://api.tiles.mapbox.com/",
  "https://fonts.googleapis.com/",
  "https://use.fontawesome.com/",
  "https://cdn.jsdelivr.net",
  "https://stackpath.bootstrapcdn.com/",
];
const connectSrcUrls = [
  "https://api.mapbox.com/",
  "https://a.tiles.mapbox.com/",
  "https://b.tiles.mapbox.com/",
  "https://events.mapbox.com/",
];
const fontSrcUrls = ["https://fonts.gstatic.com/"];
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: [],
      connectSrc: ["'self'", ...connectSrcUrls],
      scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
      styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
      workerSrc: ["'self'", "blob:"],
      objectSrc: [],
      imgSrc: [
        "'self'",
        "blob:",
        "data:",
        "https://res.cloudinary.com/dnl8zm7fi/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
        "https://images.unsplash.com/",
      ],
      fontSrc: ["'self'", ...fontSrcUrls],
    },
  })
);
app.use(helmet.crossOriginEmbedderPolicy({ policy: "credentialless" }));
const mongoose = require("mongoose");
const db_url = process.env.DB_URL || "mongodb://localhost:27017/lets-camp"; //process.env.DB_URL;
const secret = process.env.SECRET || "thisshouldbeabettersecret";
//mongodb://localhost:27017/lets-camp
const store = new MongoStore({
  mongoUrl: db_url,
  secret,
  touchAfter: 24 * 3600,
});
store.on("error", function (e) {
  console.log("SESSION STORE ERROR", e);
});

const sessionConfig = {
  store,
  name: "strange",
  secret,
  //following 2 are for session deprecation warning in console to go away
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //in order to run only on https websites
    //secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
app.use(passport.initialize());
app.use(passport.session());
passport.use(new passportLocal(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

mongoose.connect(db_url, {});
mongoose.connection.on(
  "error",
  console.error.bind(console, "connection error:")
);
mongoose.connection.once("open", () => {
  console.log("Database Connected");
});

//**************************************Routes ******************************** */
//Without this line I could not get the contents of the form here. This enables the parsing of req.body
app.use(express.urlencoded({ extended: true }));
//for restful routing
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

app.use((req, res, next) => {
  // console.log(req.session);
  // console.log(req.session.originalUrl);
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});

//This is setting our route which is to tell the express app what to do when any of the following routes are asked for via browser.
app.get("/", (req, res) => {
  res.render("Home");
});

// app.get("/fakeuser", async (req, res) => {
//   const user = new User({ email: "kyahaal@goo.com", username: "googoo" });
//   const newUser = await User.register(user, "cow");
//   res.send(newUser);
// });

app.use("/", userRoutes);
app.use("/campgrounds", campgroundRoutes);
app.use("/campgrounds/:id/reviews", reviewRoutes);

app.use((err, req, res, next) => {
  const { statusCode = 500 } = err;
  console.log("------------x------------x------------");
  console.log(err);
  console.log("------------x------------x------------");
  if (!err.message) err.message = "Something Went Wrong!";
  res.status(statusCode).render("error", { err });
});

let count = 0;
app.all("*", (req, res, next) => {
  count++;
  console.log(`Count: ${count}`);
  // console.log(req);
  next(new ExpressError("Page not found", 404));
});

//This is to set the express app server running on the port spectified and telling us what it should do when it is successfull
const port = process.env.PORT;
app.listen(port, () => {
  console.log("Listening on port: ", port);
});
