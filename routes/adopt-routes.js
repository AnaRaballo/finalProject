const mongoose = require("mongoose");
const express = require("express");
const multer = require("multer");
const adoptRoutes = express.Router();

const Adoption = require('../models/adoption-model');

//multer for photo
const myUpload = multer({
    dest: __dirname + "/../public/uploads/"
});

//=================== CREATE NEW DOG FOR ADOPTION ===================
adoptRoutes.post('/api/adoption/new', myUpload.single('phonePic'), (req, res, next) => {
    if (!req.user){
        res.status(401).json({ message: "Log in to post"});
        return;
    }
    const newDogAdoption = new Adoption ({
        description : req.body.dogDescription,
        owner: req.user._id
    });
    if(req.file){
        newDogAdoption.image = '/uploads' + req.file.filename
    }

    newDogAdoption.save((err) => {
        if(err){
            res.status(500).json({ message: "Database error"});
            return;
        }
        //validation errors
        if(err && newDogAdoption.errors){
            res.status(400).json({
                descriptionError: newDogAdoption.errors.description,
            });
            return;
        }
        req.user.encryptedPassword = undefined;
        newDogAdoption.user = req.user;

        res.status(200).json(newDogAdoption);
    });
});

//=================== LIST DOGS FOR ADPTION ===================
adoptRoutes.get('/api/adoption', (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Log in to see dogs for adoption"});
    return;
    }
    Adoption.find()
    .populate('user', { encryptedPassword: 0 })
    .exec((err, allTheDogs) => {
        if (err) {
            res.status(500).json({ message: "Error displaying dogs"});
            return;
        }
        res.status(200).json(allTheDogs);
    });
});

//=================== LIST A SINGLE DOG ===================
adoptRoutes.get("/api/adoption/:id", (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Log in to see dog" });
        return;
    }
    if(!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
    }

    Adoption.findById(req.params.id, (err, theDog) => {
        if (err) {
            res.status(500).json({ message: "Dog find went bad"});
            return;
        }

        res.status(200).json(theDog);
    });
});

//=================== UPDATE DOG INFO ===================
adoptRoutes.put('/api/adoption/:id', (req, res, next) => {
    if(!req.user) {
        res.status(401).json({ message: "Log in to update dog info"});
        return;
    }
    if(!mongoose.Types.ObjectId(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid"});
        return;
    }

        const updates = {
            description : req.body.dogDescription,
            image: req.body.image
        };
    Adoption.findByIdAndUpdate(req.params.id, updates, err => {
        if (err) {
            res.json(err);
            return;
        }

        res.json({
            message: "Dog updated successfully"
        });
    });
});

//=================== DELETE DOG ===================
adoptRoutes.delete("/api/adoption/:id", (req, res, next) => {
    if (!req.user) {
        res.status(401).json({ message: "Log in to delete dog"});
        return;
    }
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
        res.status(400).json({ message: "Specified id is not valid" });
        return;
    }

    Adoption.remove({ _id: req.params.id }, err => {
        if (err) {
            res.json(err);
            return;
        }

        res.json({
            message: "Dog has been removed"
        });
    });
});

module.exports = adoptRoutes;