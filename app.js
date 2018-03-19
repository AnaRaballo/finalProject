var express = require('express');
var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');
var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require("mongoose");
var session = require('express-session');
var passport = require('passport');
var cors = require('cors');
const nodemailer = require('nodemailer');
// const smtp = require('nodemailer-smtp-transport');


require('./configs/passport-config');

mongoose.connect('mongodb://localhost/secondProject')

var app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

//Session
app.use(session({
  secret:"Secret",
  resave: true,
  saveUninitialized: true
}));

//Passport
app.use(passport.initialize());
app.use(passport.session());
app.use(
  cors({
    credentials:true,
    origin: ["http://localhost:4200"] //this domain is allowed to send cookies
  })
);

//====================== ROUTES ========================
var index = require("./routes/index");
app.use("/", index);

var authRoutes = require("./routes/auth-routes");
app.use("/", authRoutes);

var adoptRoutes = require("./routes/adopt-routes");
app.use("/", adoptRoutes);

var lostRoutes = require("./routes/lost-routes");
app.use("/", lostRoutes);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// app.use((req, res, next) = {
//   //If no routes match, send to Angular HTML
//   res.sendFile(__dirname + "/public/index.html");
// });

// error handler
app.use(function(err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get('env') === 'development' ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render('error');
});

module.exports = app;
