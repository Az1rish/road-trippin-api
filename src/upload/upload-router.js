const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const formUpload = UploadService.single('image')




uploadRouter
    .post('/image', function(req, res) {
        formUpload(req, res, function(err) { 
            if (err) {
                return res.status(422).send({ error: err.message });
            }
            
            const image = req.file.location
            const { title, location, description } = req.body
            const newPhoto = { title, image, location, description }
            
            return PhotoService.insertPhoto(req.app.get('db'), newPhoto)
                .then(res.json({ newPhoto }))
        });
    });

module.exports = uploadRouter;