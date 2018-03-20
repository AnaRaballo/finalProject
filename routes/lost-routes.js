// import { log } from '../../../../../Library/Caches/typescript/2.6/node_modules/@types/async';

const mongoose = require('mongoose');
const express = require("express");
const multer = require("multer");
const lostRoutes = express.Router();
const nodemailer = require('nodemailer');
// const smtp = require('nodemailer-smtp-transport');

const LostFound = require('../models/lost-model');
const NodeGeocoder = require('node-geocoder');

const options = {
  provider: 'google',
 
  // Optional depending on the providers
  httpAdapter: 'https', // Default
  apiKey: 'AIzaSyDg8RJxITThryFICnALvvijIyvMl8TYgjg', // for Mapquest, OpenCage, Google Premier
  formatter: null         // 'gpx', 'string', ...
};
 
const geocoder = NodeGeocoder(options);
const geocoder2 = NodeGeocoder(options);

//multer for photo
const myUploader = multer({
    dest: __dirname + "/../public/uploads/"
});

//=================== CREATE NEW LOST DOG ===================
lostRoutes.post('/api/lost', myUploader.single('lostDogImage'), (req, res, next) => {
    if (!req.user){
        res.status(401).json({ message: "Log in to post"});
        return;
    }

    geocoder.geocode(req.body.lostDogLocation)
  .then(function(info) {
    var locationInfo = info;
    const newLostDog = new LostFound ({
        // dogPicture: req.file.filename,
        location: req.body.lostDogLocation,
        owner: req.user._id,
        ownerEmail: req.user.email,
        latitude: locationInfo[0].latitude,
        longitude: locationInfo[0].longitude
    })
    console.log("--------", req.user)

    if(req.file){
        newLostDog.image = "/uploads/" + req.file.filename
    }
    newLostDog.save((err) => {
        if(err){
            console.log(newLostDog)
            res.status(500).json({ message: "Database error"});
            return;
        }
        //validation errors
        if(err && newLostDog.errors){
            res.status(400).json({
                descriptionError: newLostDog.errors.description,
            })
            return;
        }
        req.user.encryptedPassword = undefined;
        newLostDog.user = req.user;

        res.status(200).json(newLostDog);
    });



  })
  .catch(function(err) {
    console.log(err);
  });

  

});

//=================== LIST LOST DOGS ===================
lostRoutes.get('/api/lost', (req, res, next) => {
    // if (!req.user) {
    //     res.status(401).json({ message: "Log in to see lost dogs"});
    // return;
    // }
    LostFound.find()
    .populate('user', { encryptedPassword: 0 })
    .exec((err, allLostDogs) => {
        if (err) {
            res.status(500).json({ message: "Error displaying dogs"});
            return;
        }
        res.status(200).json(allLostDogs);
    });
});

//=================== LIST A SINGLE LOST DOG ===================
lostRoutes.get("/api/lost/:id", (req, res, next) => {
    // if (!req.user) {
    //     res.status(401).json({ message: "Log in to see dog"});
    //     return;
    // }
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid"});
        return;
    }

    LostFound.findById(req.params.id, (err, lostDog) => {
        if (err) {
            res.status(500).json({ message: "Lost Dog find went bad"});
            return;
        }

        res.status(200).json(lostDog);
    });
});

//=================== UPDATE LOST DOG INFO ===================
lostRoutes.put('/api/lost/:id', (req, res, next) => {
    if(!req.user) {
        res.status(401).json({ message: "Log in to update lost dog info" });
        return;
    }
    if (!mongoose.Types.ObjectId(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid"});
        return;
    }

    geocoder2.geocode(req.body.dogLocation)
    .then(function(info) {
        // var locationInfo = info;
        
        const updateLostDog = {
            location: req.body.dogLocation,
            latitude: info[0].latitude,
            longitude: info[0].longitude
        };
        // if(req.body.image){
            //     updateLostDog.image = req.body.image
            // }
       
            
            
            LostFound.findByIdAndUpdate(req.params.id, updateLostDog, err => {
                if (err) {
                    res.json(err);
                    return;
                }
                
                res.json({
                    message: "Lost Dog updated successfully"
                });
            });
        });
    });

//=================== LOST DOG FOUND ===================
lostRoutes.delete("/api/lost/:id", (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Log in to delete dog" });
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
    }

    LostFound.remove({ _id: req.params.id }, err => {
        if (err) {
            res.json(err);
            return;
        }

        res.json({
            message: "Lost Dog has been removed"
        });
    });
});

module.exports = lostRoutes;

