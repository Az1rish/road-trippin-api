const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');

const config = require('../config');

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS,
  accessKeyId: config.AWS_ACCESS_KEY,
  region: 'us-west-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
      cb(null, true)
  } else {
      cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
  }
}

const UploadService = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: 'road-trippin-images',
    acl: 'public-read',
    metadata: function (req, file, cb) {
      cb(null, {fieldName: 'TESTING_META_DATA!'});
    },
    key: function (req, file, cb) {
      cb(null, Date.now().toString())
    }
  }),
  limits: { fileSize: 4000000 }, // In Bytes: 4000000 bytes = 4 MB
})

module.exports = UploadService;