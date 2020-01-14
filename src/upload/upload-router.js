const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const formUpload = UploadService.single('image');



uploadRouter
    .post('/image', function(req, res) {
        // console.log("Starting uploadRouter.post /image")
        formUpload(req, res, function(err) {
            // console.log("single upload successful")
            // console.log(req)
            if (err) {
                return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
            }
            // console.log("about to insert image to db")
            const image = req.file.location
            const { title, location, content } = req.body
            console.log(req.body)
            const newPhoto = { title, image, location, content }
            // console.log(newPhoto)
            return PhotoService.insertPhoto(req.app.get('db'), newPhoto)
                .then(res.json({ newPhoto }))
            // console.log("db insertion successful")
            // return res.json({'imageUrl': req.file.location});
        });
    });

module.exports = uploadRouter;