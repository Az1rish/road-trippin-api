const express = require("express");
const uploadRouter = express.Router();

const UploadService = require('./upload-service');

const singleUpload = UploadService.single('image');

uploadRouter.post('/image', function(req, res) {

  singleUpload(req, res, function(err) {

    if (err) {
      return res.status(422).send({errors: [{title: 'File Upload Error', detail: err.message}] });
    }

    return res.json({'imageUrl': req.file.location});
  });
});

module.exports = uploadRouter;