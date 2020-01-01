const knex = require('knex')
const app = require('../src/app')
const helpers = require('./test-helpers')

describe('Comments Endpoints', function() {
  let db

  const {
    testPhotos,
    testUsers,
  } = helpers.makePhotosFixtures()

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DB_URL,
    })
    app.set('db', db)
  })

  after('disconnect from db', () => db.destroy())

  before('cleanup', () => helpers.cleanTables(db))

  afterEach('cleanup', () => helpers.cleanTables(db))

  describe(`POST /api/comments`, () => {
    beforeEach('insert photos', () =>
      helpers.seedPhotosTables(
        db,
        testUsers,
        testPhotos,
      )
    )

    it(`creates a comment, responding with 201 and the new comment`, function() {
      this.retries(3)
      const testPhoto = testPhotos[0]
      const testUser = testUsers[0]
      const newComment = {
        text: 'Test new comment',
        rating: 3,
        photo_id: testPhoto.id,
      }
      return supertest(app)
        .post('/api/comments')
        .set('Authorization', helpers.makeAuthHeader(testUsers[0]))
        .send(newComment)
        .expect(201)
        .expect(res => {
          expect(res.body).to.have.property('id')
          expect(res.body.rating).to.eql(newComment.rating)
          expect(res.body.text).to.eql(newComment.text)
          expect(res.body.photo_id).to.eql(newComment.photo_id)
          expect(res.body.user.id).to.eql(testUser.id)
          expect(res.headers.location).to.eql(`/api/comments/${res.body.id}`)
          const expectedDate = new Date().toLocaleString()
          const actualDate = new Date(res.body.date_created).toLocaleString()
          expect(actualDate).to.eql(expectedDate)
        })
        .expect(res =>
          db
            .from('road_trippin_comments')
            .select('*')
            .where({ id: res.body.id })
            .first()
            .then(row => {
              expect(row.text).to.eql(newComment.text)
              expect(row.rating).to.eql(newComment.rating)
              expect(row.photo_id).to.eql(newComment.photo_id)
              expect(row.user_id).to.eql(testUser.id)
              const expectedDate = new Date().toLocaleString()
              const actualDate = new Date(row.date_created).toLocaleString()
              expect(actualDate).to.eql(expectedDate)
            })
        )
    })

    const requiredFields = ['text', 'rating', 'photo_id']

    requiredFields.forEach(field => {
      const testPhoto = testPhotos[0]
      const testUser = testUsers[0]
      const newComment = {
        text: 'Test new comment',
        rating: 3,
        photo_id: testPhoto.id,
      }

      it(`responds with 400 and an error message when the '${field}' is missing`, () => {
        delete newComment[field]

        return supertest(app)
          .post('/api/comments')
          .set('Authorization', helpers.makeAuthHeader(testUser))
          .send(newComment)
          .expect(400, {
            error: `Missing '${field}' in request body`,
          })
      })
    })
  })
})
