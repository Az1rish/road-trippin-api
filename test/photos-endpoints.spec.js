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

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/photos`)
          .expect(200)
          .expect(res => {
            expect(res.body[0].title).to.eql(expectedPhoto.title)
            expect(res.body[0].content).to.eql(expectedPhoto.content)
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

      it('removes XSS attack content', () => {
        return supertest(app)
          .get(`/api/photos/${maliciousPhoto.id}`)
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .expect(200)
          .expect(res => {
            expect(res.body.title).to.eql(expectedPhoto.title)
            expect(res.body.content).to.eql(expectedPhoto.content)
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
})
