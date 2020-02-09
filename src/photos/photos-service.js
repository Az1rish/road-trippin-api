/* eslint-disable camelcase */
/* eslint-disable no-use-before-define */
const xss = require('xss');
const Treeize = require('treeize');
const aws = require('aws-sdk');
const multer = require('multer');
const multerS3 = require('multer-s3');
const config = require('../config');

const PhotosService = {
  insertPhoto(db, newPhoto) {
    return db
      .insert(newPhoto)
      .into('road_trippin_photos')
      .returning('*')
      .then(([photo]) => photo)
      .then((photo) => PhotosService.getById(db, photo.id));
  },
  getAllPhotos(db) {
    return db
      .from('road_trippin_photos AS rtp')
      .select(
        'rtp.id',
        'rtp.title',
        'rtp.location',
        'rtp.date_created',
        'rtp.description',
        'rtp.image',
        ...userFields,
        db.raw(
          'count(DISTINCT comm) AS number_of_comments'
        ),
        db.raw(
          'AVG(comm.rating) AS average_comment_rating'
        )
      )
      .leftJoin(
        'road_trippin_comments AS comm',
        'rtp.id',
        'comm.photo_id'
      )
      .leftJoin(
        'road_trippin_users AS usr',
        'rtp.user_id',
        'usr.id'
      )
      .groupBy('rtp.id', 'usr.id')
      .orderBy('rtp.date_created', 'desc');
  },

  getPhotosByUser(db, user_id) {
    return PhotosService.getAllPhotos(db)
      .where('usr.id', user_id);
  },

  getPhotosByLocation(db, location) {
    return PhotosService.getAllPhotos(db)
      .where('rtp.location', location);
  },

  deletePhoto(db, photo_id, user_id) {
    return db('road_trippin_photos AS rtp')
      .where({
        'rtp.id': photo_id,
        'rtp.user_id': user_id
      })
      .del();
  },

  updatePhoto(db, photo_id, user_id, newPhotoFields) {
    return db('road_trippin_photos AS rtp')
      .where({
        'rtp.id': photo_id,
        'rtp.user_id': user_id
      })
      .update(newPhotoFields);
  },

  getById(db, id) {
    return PhotosService.getAllPhotos(db)
      .where('rtp.id', id)
      .first();
  },

  getCommentsForPhoto(db, photo_id) {
    return db
      .from('road_trippin_comments AS comm')
      .select(
        'comm.id',
        'comm.rating',
        'comm.text',
        'comm.date_created',
        ...userFields
      )
      .where('comm.photo_id', photo_id)
      .leftJoin(
        'road_trippin_users AS usr',
        'comm.user_id',
        'usr.id'
      )
      .groupBy('comm.id', 'usr.id');
  },

  serializePhotos(photos) {
    return photos.map(this.serializePhoto);
  },

  serializePhoto(photo) {
    const photoTree = new Treeize();

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const photoData = photoTree.grow([photo]).getData()[0];

    return {
      id: photoData.id,
      title: xss(photoData.title),
      description: xss(photoData.description),
      location: xss(photoData.location),
      date_created: photoData.date_created,
      image: photoData.image,
      user: photoData.user || {},
      number_of_comments: Number(photoData.number_of_comments) || 0,
      average_comment_rating: Math.round(photoData.average_comment_rating) || 0
    };
  },

  serializePhotoComments(comments) {
    return comments.map(this.serializePhotoComment);
  },

  serializePhotoComment(comment) {
    const commentTree = new Treeize();

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const commentData = commentTree.grow([comment]).getData()[0];

    return {
      id: commentData.id,
      rating: commentData.rating,
      photo_id: commentData.photo_id,
      text: xss(commentData.text),
      user: commentData.user || {},
      date_created: commentData.date_created
    };
  }
};

const userFields = [
  'usr.id AS user:id',
  'usr.user_name AS user:user_name',
  'usr.full_name AS user:full_name',
  'usr.date_created AS user:date_created',
  'usr.date_modified AS user:date_modified'
];

aws.config.update({
  secretAccessKey: config.AWS_SECRET_ACCESS,
  accessKeyId: config.AWS_ACCESS_KEY,
  region: 'us-west-1'
});

const s3 = new aws.S3();

const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'image/jpeg' || file.mimetype === 'image/png') {
    cb(null, true);
  } else {
    cb(new Error('Invalid Mime Type, only JPEG and PNG'), false);
  }
};

const UploadService = multer({
  fileFilter,
  storage: multerS3({
    s3,
    bucket: 'road-trippin-images',
    acl: 'public-read',
    metadata(req, file, cb) {
      cb(null, { fieldName: 'TESTING_META_DATA!' });
    },
    key(req, file, cb) {
      cb(null, Date.now().toString());
    }
  }),
  limits: { fileSize: 4000000 } // In Bytes: 4000000 bytes = 4 MB
});

module.exports = {
  PhotosService,
  UploadService
};
