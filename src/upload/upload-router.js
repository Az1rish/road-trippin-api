const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const formUpload = UploadService.single('image')




uploadRouter
    .post('/image', function(req, res) {
        console.log("Starting uploadRouter.post /image")
        formUpload(req, res, function(err) {
            console.log("form upload successful")
            // console.log(req)
            if (err) {
                return res.status(422).send({ error: err.message });
            }
            console.log(req.file)
            console.log(req.body)
            console.log("about to insert image to db")
            const image = req.file.location
            const { title, location, description } = req.body
            
            const newPhoto = { title, image, location, description }
            console.log(newPhoto)
            return PhotoService.insertPhoto(req.app.get('db'), newPhoto)
                .then(res.json({ newPhoto }))
            // console.log("db insertion successful")
            // return res.json({'imageUrl': req.file.location});
        });
    });

module.exports = uploadRouter;