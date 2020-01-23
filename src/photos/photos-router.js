const express = require('express')
const { PhotosService, UploadService } = require('./photos-service')
const { requireAuth } = require('../middleware/jwt-auth')
const photosRouter = express.Router()
const jsonBodyParser = express.json()
const formUpload = UploadService.single('image')

photosRouter
  .route('/')
  .get((req, res, next) => {
    PhotosService.getAllPhotos(req.app.get('db'))
      .then(photos => {
        res.json(PhotosService.serializePhotos(photos))
      })
      .catch(next)
  })
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
        
        return PhotosService.insertPhoto(req.app.get('db'), newPhoto)
            .then(photo => {
              res
                .status(201)
                .location(req.originalUrl + `/${photo.id}`)
                .json({ photo })
            });
    });        
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
    .then(numAffectedRows => {
      if (numAffectedRows === 0) {
        return res.status(403).json({
          error: { message: `Not authorized to delete this photo` }
        })
      } 
      return res.json({ message: "Successfully deleted" }).status(204).end()
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
