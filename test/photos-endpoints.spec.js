const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Photos Endpoints', function() {
  let db

  const {
    testUsers,
    testPhotos,
    testComments,
  } = helpers.makePhotosFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  
  describe(`GET /api/photos`, () => {
    context(`Given no photos`, () => {
      it(`responds with 200 and an empty list`, () => {
        return supertest(app)
          .get('/api/photos')
          .expect(200, [])
      })
    })

    context('Given there are photos in the database', () => {
      beforeEach('insert photos', () =>
        helpers.seedPhotosTables(
          db,
          testUsers,
          testPhotos,
          testComments,
        )
      )

      it('responds with 200 and all of the photos', () => {
        const expectedPhotos = testPhotos.map(photo =>
          helpers.makeExpectedPhoto(
            testUsers,
            photo,
            testComments,
          )
        )
        return supertest(app)
          .get('/api/photos')
          .expect(200, expectedPhotos)
      })
    })

    context(`Given an XSS attack photo`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPhoto,
        expectedPhoto,
      } = helpers.makeMaliciousPhoto(testUser)

      beforeEach('insert malicious photo', () => {
        return helpers.seedMaliciousPhoto(
          db,
          testUser,
          maliciousPhoto,
        )
      })

      it('removes XSS attack description', () => {
        return supertest(app)
          .get(`/api/photos`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedPhoto.title)
            expect(res.body[0].description).to.eql(expectedPhoto.description)
          })
      })
    })
  })

  describe(`GET /api/photos/:photo_id`, () => {
    context(`Given no photos`, () => {
      beforeEach(() =>
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const photoId = 123456
        return supertest(app)
          .get(`/api/photos/${photoId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Photo doesn't exist` })
      })
    })

    context('Given there are photos in the database', () => {
      beforeEach('insert photos', () =>
        helpers.seedPhotosTables(
          db,
          testUsers,
          testPhotos,
          testComments,
        )
      )

      it('responds with 200 and the specified photo', () => {
        const photoId = 2
        const expectedPhoto = helpers.makeExpectedPhoto(
          testUsers,
          testPhotos[photoId - 1],
          testComments,
        )

        return supertest(app)
          .get(`/api/photos/${photoId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedPhoto)
      })
    })

    context(`Given an XSS attack photo`, () => {
      const testUser = helpers.makeUsersArray()[1]
      const {
        maliciousPhoto,
        expectedPhoto,
      } = helpers.makeMaliciousPhoto(testUser)

      beforeEach('insert malicious photo', () => {
        return helpers.seedMaliciousPhoto(
          db,
          testUser,
          maliciousPhoto,
        )
      })

      it('removes XSS attack description', () => {
        return supertest(app)
          .get(`/api/photos/${maliciousPhoto.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedPhoto.title)
            expect(res.body.description).to.eql(expectedPhoto.description)
          })
      })
    })
  })

  describe(`GET /api/photos/:photo_id/comments`, () => {
    context(`Given no photos`, () => {
      beforeEach(() => 
        helpers.seedUsers(db, testUsers)
      )
      it(`responds with 404`, () => {
        const photoId = 123456
        return supertest(app)
          .get(`/api/photos/${photoId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(404, { error: `Photo doesn't exist` })
      })
    })

    context('Given there are comments for photo in the database', () => {
      beforeEach('insert photos', () =>
        helpers.seedPhotosTables(
          db,
          testUsers,
          testPhotos,
          testComments,
        )
      )

      it('responds with 200 and the specified comments', () => {
        const photoId = 1
        const expectedComments = helpers.makeExpectedPhotoComments(
          testUsers, photoId, testComments
        )

        return supertest(app)
          .get(`/api/photos/${photoId}/comments`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
          .expect(200, expectedComments)
      })
    })
  })

  describe.skip(`POST /photos`, () => {
    it(`creates a photo, responding with 201 and the new photo`, function() {
      this.retries(3)
      const testUser = (helpers.makeUsersArray())[0]
      const newPhoto = {
        title: 'Test title',
        location: 'Mars',
        description: 'Test photo description...'
      }
      return supertest(app)
        .post('/api/photos')
        .set('Authorization', helpers.makeAuthHeader(testUser))
        .send(newPhoto)
        .expect(201)
        .expect(res => {
          expect(res.body.title).to.eql(newPhoto.title)
          expect(res.body.style).to.eql(newPhoto.style)
          expect(res.body.description).to.eql(newPhoto.description)
          expect(res.body).to.have.property('id')
          expect(res.headers.location).to.eql(`/photos/${res.body.id}`)
          const expected = new Date().toLocaleString('en', { timeZone: 'UTC' })
          const actual = new Date(res.body.date_created).toLocaleString()
          expect(actual).to.eql(expected)
        })
        .then(postRes =>
          supertest(app)    
            .get(`/photos/${postRes.body.id}`)
            .expect(postRes.body)
        )
    })
  })

  describe.skip(`DELETE /photos/:photo_id`, () => {
    context(`Given no photos`, () => {
      it(`responds with 404`, () => {
        const photoId = 123456
        return supertest(app)
          .delete(`/photos/${photoId}`)
          .expect(404, { error: { message: `Photo doesn't exist` } })
      })
    })

    context(`Given there are photos in the database`, () => {
      const testUsers = helpers.makeUsersArray()
      const testPhotos = helpers.makePhotosArray(testUsers)

      beforeEach('insert photos', () => {
        return db
          .into(`road_trippin_photos`)
          .insert(testPhotos)
      })

      it('responds with 200 and removes the photo', () => {
        const idToRemove = 2
        const expectedPhotos = testPhotos.filter(photo => photo.id !== idToRemove)
        
        return supertest(app)
          .delete(`/api/photos/${idToRemove}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(200)
          .then(res =>
            supertest(app)
              .get('/api/photos')
              .expect(expectedPhotos)
          )
      })
    })
  })

  describe.skip(`PATCH /api/photos/:photo_id`, () => {
    context(`Given no photos`, () => {
      it(`responds with 404`, () => {
        const testUsers = helpers.makeUsersArray()
        const photoId = 123456

        beforeEach('insert users', () => {
          return db
            .into(`road_trippin_users`)
            .insert(testUsers)
        })

        return supertest(app)
          .patch(`/api/photos/${photoId}`)
          .set('Authorization', helpers.makeAuthHeader(testUsers[1]))
          .expect(404, { error: { message: `Photo doesn't exist` } })
      })
    })

    context('Given there are photos in the database', () => {
      const testPhotos = makePhotosArray()
    
      beforeEach('insert photos', () => {
        return db
          .into('road_trippin_photos')
          .insert(testPhotos)
      })
      
      it('responds with 204 and updates the photo', () => {
        const idToUpdate = 2
        const updatePhoto = {
          title: 'updated photo title',
          style: 'Interview',
          content: 'updated photo content',
        }
        const expectedPhoto = {
          ...testPhotos[idToUpdate - 1],
          ...updateArticle
        }
        return supertest(app)
          .patch(`/api/photos/${idToUpdate}`)
          .send(updatePhoto)
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/photos/${idToUpdate}`)
              .expect(expectedPhoto)
          )
      })

      it(`responds with 400 when no required fields supplied`, () => {
        const idToUpdate = 2
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({ irrelevantField: 'foo' })
          .expect(400, {
            error: {
              message: `Request body must contain either 'title', 'style' or 'content'`
            }
          })
      })

      it(`responds with 204 when updating only a subset of fields`, () => {
        const idToUpdate = 2
        const updateArticle = {
          title: 'updated article title',
        }
        const expectedArticle = {
          ...testArticles[idToUpdate - 1],
          ...updateArticle
        }
        
        return supertest(app)
          .patch(`/api/articles/${idToUpdate}`)
          .send({
            ...updateArticle,
            fieldToIgnore: 'should not be in GET response'
          })
          .expect(204)
          .then(res =>
            supertest(app)
              .get(`/api/articles/${idToUpdate}`)
              .expect(expectedArticle)
          )
      })
          
    })
  })
})
