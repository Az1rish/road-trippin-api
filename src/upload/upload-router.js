const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const singleUpload = UploadService.single('image');



uploadRouter
    .post('/image', function(req, res) {
        console.log(req)
        singleUpload(req, res, function(err) {
            console.log(req)
            if (err) {
                return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
            }
            
            PhotoService.insertPhoto(req.app.get('db'), req.file.location)
            
            return res.json({'imageUrl': req.file.location});
        });

    });

module.exports = uploadRouter;