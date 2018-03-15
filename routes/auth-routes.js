const mongoose = require('mongoose');
const express = require("express");
const bcrypt = require("bcrypt");
const passport = require("passport");

const User = require('../models/user-model');

const authRoutes = express.Router();

authRoutes.post('/api/signup', (req, res, next) => {
    if(!req.body.signUpUsername || !req.body.signUpPassword){
        res.status(400).json({message: "Provide username and password"});
        return;
    }
    User.findOne({ username: req.body.signUpUsername }, (err, userFromDb) => {
        if(err){
            res.status(500).json({message: "Incorrect username"});
            return;
        }
        if(userFromDb){
            res.status(400).json({message: "Username taken"});
            return;
        }

        const salt = bcrypt.genSaltSync(10);
        const scrambledPassword = bcrypt.hashSync(req.body.signUpPassword, salt);

        const theUser = new User ({
            username: req.body.signUpUsername,
            encryptedPassword: scrambledPassword
        });
        theUser.save((err) => {
            if (err){
                res.status(500).json({message:"User did not save"});
                return;
            }
            //Automatically log in user after sign up
            req.login(theUser,(err) => {
                if(err){
                    res.status(500).json({message: "Could not login"});
                    return;
                }
                // Clear encryptedPassword from object before sending
                theUser.encryptedPassword = undefined;

                // Send user info to frontend
                res.status(200).json(theUser);
            });
        });
    });
});

authRoutes.post('/api/login', (req, res, next) => {
    const authFunction = passport.authenticate('local', (err, theUser, failureDetails) => {

        if(err){
            res.status(500).json({message: "Unknown error"});
            return;
        }
        if(!theUser) {
            res.status(401).json(failureDetails);
            return;
        }
        req.login(theUser, (err) => {
            if(err){
                res.status(500).json({message: "Something went wrong in session"});
                return;
            }
            theUser.encryptedPassword = undefined;
            res.status(200).json(theUser);
        });
    });
    authFunction(req, res, next);
});

authRoutes.post("/api/logout", (req, res, next) => {
    req.logout();
    res.status(200).json({ message: "Logged out" });
});

authRoutes.get("/api/checklogin", (req, res, next) => {
    if (req.isAuthenticated()) {
        res.status(200).json(req.user);
        return;
    }

    res.status(401).json({ message: "Unauthorized" });
});

function notLogged(res, res, next) {
    if (!req.isAuthenticated()) {
        res.status(403).json({ message: "FORBIDDEN" });
        return;
    }
    next();
}

authRoutes.get("/api/private", notLogged, (req, res, next) => {
    res.json({ message: "" });
});

module.exports = authRoutes;