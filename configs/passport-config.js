const passport = require("passport");
const bcrypt = require("bcrypt");
const LocalStrategy = require("passport-local").Strategy;

const UserModel = require("../models/user-model");

// Save user ID (called when log in)
passport.serializeUser((userFromDb, next) =>{
    next(null, userFromDb._id);
});

// Retrieve user info from DB with ID
passport.deserializeUser((userID, next) =>{
    UserModel.findByID(userID, (err, userFromDb) => {
        if (err) {
            next(err);
            return;
        }

        next(null, userFromDb);
    });
});

//username & password login strategy
passport.use(
    new LocalStrategy(
        {
         usernameField: "loginUsername",
         passwordField: "loginPassword"   
        },
        (theUsername, thePassword, next) => {
            UserModel.findOne({ username: theUsername }, (err, userFromDb) => {
                if (err) {
                    next(err);
                    return;
                }
                if (userFromDb === null) {
                    next(null, false, {message: "Username does not exist"});
                    return;
                }
                if (bcrypt.compareSync(thePassword, userFromDb.encryptedPassword) === false){
                    next(null, false, {message: "Wrong password"});
                    return;
                }
                next(null, userFromDb);
            });
        }
    )
);

