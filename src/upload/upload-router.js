const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const singleUpload = UploadService.single('image');



uploadRouter
    .post('/image', function(req, res) {
        
        singleUpload(req, res, function(err) {
            if (err) {
                return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
            }

            try {PhotoService.insertPhoto(req.app.get('db'), req.file.location)}
            catch(error) {console.error(error)}
            return res.json({'imageUrl': req.file.location});
        });

    });

module.exports = uploadRouter;