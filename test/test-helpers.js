const bcrypt = require('bcryptjs')
const jwt = require('jsonwebtoken')

function makeUsersArray() {
  return [
    {
      id: 1,
      user_name: 'test-user-1',
      full_name: 'Test user 1',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      user_name: 'test-user-2',
      full_name: 'Test user 2',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      user_name: 'test-user-3',
      full_name: 'Test user 3',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      user_name: 'test-user-4',
      full_name: 'Test user 4',
      password: 'password',
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ]
}

function makePhotosArray(users) {
  return [
    {
      id: 1,
      title: 'First test photo!',
      image: 'http://placehold.it/500x500',
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      location: 'Jupiter',
    },
    {
      id: 2,
      title: 'Second test photo!',
      image: 'http://placehold.it/500x500',
      user_id: users[1].id,
      date_created: '2029-01-22T16:28:32.615Z',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      location: 'Jupiter',
    },
    {
      id: 3,
      title: 'Third test photo!',
      image: 'http://placehold.it/500x500',
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      location: 'Jupiter',
    },
    {
      id: 4,
      title: 'Fourth test photo!',
      image: 'http://placehold.it/500x500',
      user_id: users[3].id,
      date_created: '2029-01-22T16:28:32.615Z',
      description: 'Lorem ipsum dolor sit amet, consectetur adipisicing elit. Natus consequuntur deserunt commodi, nobis qui inventore corrupti iusto aliquid debitis unde non.Adipisci, pariatur.Molestiae, libero esse hic adipisci autem neque ?',
      location: 'Jupiter',
    },
  ]
}

function makeCommentsArray(users, photos) {
  return [
    {
      id: 1,
      rating: 2,
      text: 'First test comment!',
      photo_id: photos[0].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 2,
      rating: 3,
      text: 'Second test comment!',
      photo_id: photos[0].id,
      user_id: users[1].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 3,
      rating: 1,
      text: 'Third test comment!',
      photo_id: photos[0].id,
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 4,
      rating: 5,
      text: 'Fourth test comment!',
      photo_id: photos[0].id,
      user_id: users[3].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 5,
      rating: 1,
      text: 'Fifth test comment!',
      photo_id: photos[photos.length - 1].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 6,
      rating: 2,
      text: 'Sixth test comment!',
      photo_id: photos[photos.length - 1].id,
      user_id: users[2].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
    {
      id: 7,
      rating: 5,
      text: 'Seventh test comment!',
      photo_id: photos[3].id,
      user_id: users[0].id,
      date_created: '2029-01-22T16:28:32.615Z',
    },
  ];
}

function makeExpectedPhoto(users, photo, comments=[]) {
  const user = users
    .find(user => user.id === photo.user_id)

  const photoComments = comments.filter(comment => comment.photo_id === photo.id)

  const number_of_comments = photoComments.length
  const average_comment_rating = calculateAverageCommentRating(photoComments)

  return {
    id: photo.id,
    image: photo.image,
    title: photo.title,
    description: photo.description,
    location: photo.location,
    date_created: photo.date_created,
    number_of_comments,
    average_comment_rating,
    user_id: user.id,

  }
}

function calculateAverageCommentRating(comments) {
  if(!comments.length) return 0

  const sum = comments
    .map(comment => comment.rating)
    .reduce((a, b) => a + b)

  return Math.round(sum / comments.length)
}

function makeExpectedPhotoComments(users, photoId, comments) {
  const expectedComments = comments.filter(comment => comment.photo_id === photoId)

  return expectedComments.map(comment => {
    const commentUser = users.find(user => user.id === comment.user_id)
    return {
      id: comment.id,
      text: comment.text,
      rating: comment.rating,
      date_created: comment.date_created,
      user: {
        id: commentUser.id,
        user_name: commentUser.user_name,
        full_name: commentUser.full_name,
        date_created: commentUser.date_created,
      }
    }
  })
}

function makeMaliciousPhoto(user) {
  const maliciousPhoto = {
    id: 911,
    image: 'http://placehold.it/500x500',
    date_created: new Date().toISOString(),
    title: 'Naughty naughty very naughty <script>alert("xss");</script>',
    user_id: user.id,
    description: `Bad image <img src="https://url.to.file.which/does-not.exist" onerror="alert(document.cookie);">. But not <strong>all</strong> bad.`,
    location: 'Jupiter<script>alert("xss");</script>',
  }
  const expectedPhoto = {
    ...makeExpectedPhoto([user], maliciousPhoto),
    title: 'Naughty naughty very naughty &lt;script&gt;alert(\"xss\");&lt;/script&gt;',
    description: `Bad image <img src="https://url.to.file.which/does-not.exist">. But not <strong>all</strong> bad.`,
    location: 'Jupiter&lt;script&gt;alert(\"xss\");&lt;/script&gt;'
  }
  return {
    maliciousPhoto,
    expectedPhoto,
  }
}

function makePhotosFixtures() {
  const testUsers = makeUsersArray()
  const testPhotos = makePhotosArray(testUsers)
  const testComments = makeCommentsArray(testUsers, testPhotos)
  return { testUsers, testPhotos, testComments }
}

function cleanTables(db) {
  return db.raw(
    `TRUNCATE
      road_trippin_photos,
      road_trippin_users,
      road_trippin_comments
      RESTART IDENTITY CASCADE`
  )
}

function seedUsers(db, users) {
  const preppedUsers = users.map(user => ({
    ...user,
    password: bcrypt.hashSync(user.password, 1)
  }))
  return db.into('road_trippin_users').insert(preppedUsers)
    .then(() =>
    // update the auto sequence to stay in sync
      db.raw(
        `SELECT setval('road_trippin_users_id_seq', ?)`,
        [users[users.length - 1].id],
      )
    )
}

function seedPhotosTables(db, users, photos, comments=[]) {
  // use a transaction to group the queries and auto rollback on any failure
  return db.transaction(async trx => {
    await seedUsers(trx, users)
    await trx.into('road_trippin_photos').insert(photos)
    // update the auto sequence to match the forced id values
    await trx.raw(
      `SELECT setval('road_trippin_photos_id_seq', ?)`,
      [photos[photos.length - 1].id],
    )
    // only insert comments if there are some, also update the sequence counter
    if (comments.length) {
    await trx.into('road_trippin_comments').insert(comments)
      await trx.raw(
        `SELECT setval('road_trippin_comments_id_seq', ?)`,
        [comments[comments.length - 1].id],
      )
    }
  })
}

function seedMaliciousPhoto(db, user, photo) {
  return seedUsers(db, [user])
    .then(() =>
      db
        .into('road_trippin_photos')
        .insert([photo])
    )
}

function makeAuthHeader(user, secret = process.env.JWT_SECRET) {
  const token = jwt.sign({ user_id: user.id }, 
  secret, {
    subject: user.user_name,
    algorithm: 'HS256',
  })
  return `Bearer ${token}`
}

module.exports = {
  makeUsersArray,
  makePhotosArray,
  makeExpectedPhoto,
  makeExpectedPhotoComments,
  makeMaliciousPhoto,
  makeCommentsArray,

  makePhotosFixtures,
  cleanTables,
  seedPhotosTables,
  seedMaliciousPhoto,
  makeAuthHeader,
  seedUsers,
}
