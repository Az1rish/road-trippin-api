const xss = require('xss')
const Treeize = require('treeize')

const PhotosService = {
  insertPhoto(db, newPhoto) {
    return db
      .insert(newPhoto)
      .into('road_trippin_photos')
      .returning('*')
      .then(([photo]) => photo)
      .then(photo =>
        PhotosService.getById(db, photo.id))
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
          `count(DISTINCT comm) AS number_of_comments`
        ),
        db.raw(
          `AVG(comm.rating) AS average_comment_rating`
        ),
      )
      .leftJoin(
        'road_trippin_comments AS comm',
        'rtp.id',
        'comm.photo_id',
      )
      .leftJoin(
        'road_trippin_users AS usr',
        'rtp.user_id',
        'usr.id',
      )
      .groupBy('rtp.id', 'usr.id')
  },

  getById(db, id) {
    return PhotosService.getAllPhotos(db)
      .where('rtp.id', id)
      .first()
  },

  getCommentsForPhoto(db, photo_id) {
    return db
      .from('road_trippin_comments AS comm')
      .select(
        'comm.id',
        'comm.rating',
        'comm.text',
        'comm.date_created',
        ...userFields,
      )
      .where('comm.photo_id', photo_id)
      .leftJoin(
        'road_trippin_users AS usr',
        'comm.user_id',
        'usr.id',
      )
      .groupBy('comm.id', 'usr.id')
  },

  serializePhotos(photos) {
    return photos.map(this.serializePhoto)
  },

  serializePhoto(photo) {
    const photoTree = new Treeize()

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const photoData = photoTree.grow([ photo ]).getData()[0]

    return {
      id: photoData.id,
      title: xss(photoData.title),
      description: xss(photoData.description),
      date_created: photoData.date_created,
      image: photoData.image,
      user: photoData.user || {},
      number_of_comments: Number(photoData.number_of_comments) || 0,
      average_comment_rating: Math.round(photoData.average_comment_rating) || 0,
    }
  },

  serializePhotoComments(comments) {
    return comments.map(this.serializePhotoComment)
  },

  serializePhotoComment(comment) {
    const commentTree = new Treeize()

    // Some light hackiness to allow for the fact that `treeize`
    // only accepts arrays of objects, and we want to use a single
    // object.
    const commentData = commentTree.grow([ comment ]).getData()[0]

    return {
      id: commentData.id,
      rating: commentData.rating,
      photo_id: commentData.photo_id,
      text: xss(commentData.text),
      user: commentData.user || {},
      date_created: commentData.date_created,
    }
  },
}

const userFields = [
  'usr.id AS user:id',
  'usr.user_name AS user:user_name',
  'usr.full_name AS user:full_name',
  'usr.date_created AS user:date_created',
  'usr.date_modified AS user:date_modified',
]

module.exports = PhotosService
