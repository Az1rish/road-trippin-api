const express = require("express");
const uploadRouter = express.Router();
const PhotoService = require('../photos/photos-service')
const UploadService = require('./upload-service');
const { requireAuth } = require('../middleware/jwt-auth')
const jsonBodyParser = express.json()
const formUpload = UploadService.single('image')




uploadRouter
    .route('/image')
    .post(requireAuth, jsonBodyParser, function(req, res) {
        formUpload(req, res, function(err) { 
            if (err) {
                return res.status(422).send({ error: err.message });
            }
            
            const image = req.file.location
            const { title, location, description } = req.body
            const newPhoto = { title, image, location, description }

            for (const [key, value] of Object.entries(newPhoto))
                if (value == null)
                    return res.status(400).json({
                        error: `Missing '${key}' in request body`
                    })

            newPhoto.user_id = req.user.id
            
            return PhotoService.insertPhoto(req.app.get('db'), newPhoto)
                .then(res.json({ newPhoto }))
        });

    });

module.exports = uploadRouter;