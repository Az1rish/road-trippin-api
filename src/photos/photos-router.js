const express = require('express')
const PhotosService = require('./photos-service')
const { requireAuth } = require('../middleware/jwt-auth')

const photosRouter = express.Router()

photosRouter
  .route('/')
  .get((req, res, next) => {
    PhotosService.getAllPhotos(req.app.get('db'))
      .then(photos => {
        res.json(PhotosService.serializePhotos(photos))
      })
      .catch(next)
  })

photosRouter
  .route('/myPhotos')
  .all(requireAuth)
  .get((req, res, next) => {
    PhotosService.getPhotosByUser(req.app.get('db'), req.user.id)
      .then(photos => {
        res.json(PhotosService.serializePhotos(photos))
      })
      .catch(next)
  })

photosRouter
  .route('/:photo_id')
  .all(requireAuth)
  .all(checkPhotoExists)
  .get((req, res) => {
    res.json(PhotosService.serializePhoto(res.photo))
  })
  .delete((req, res, next) => {
    PhotosService.deletePhoto(
      req.app.get('db'),
      req.params.photo_id,
      req.user.id
    )
      .then(() => {
        if (req.user.id !== res.user.id) {
          res.status(403).json({
            message: "Not Authorized"
          })
        }
        res.status(204).json({
          message: "Successfully deleted"}).end()
      })
      .catch(next)
  })

photosRouter.route('/:photo_id/comments/')
  .all(requireAuth)
  .all(checkPhotoExists)
  .get((req, res, next) => {
    PhotosService.getCommentsForPhoto(
      req.app.get('db'),
      req.params.photo_id
    )
      .then(comments => {
        res.json(PhotosService.serializePhotoComments(comments))
      })
      .catch(next)
  })

/* async/await syntax for promises */
async function checkPhotoExists(req, res, next) {
  try {
    const photo = await PhotosService.getById(
      req.app.get('db'),
      req.params.photo_id
    )

    if (!photo)
      return res.status(404).json({
        error: `Photo doesn't exist`
      })

    res.photo = photo
    next()
  } catch (error) {
    next(error)
  }
}

module.exports = photosRouter
