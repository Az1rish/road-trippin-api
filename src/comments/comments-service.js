const xss = require('xss')

const CommentsService = {
  getById(db, id) {
    return db
      .from('road_trippin_comments AS comm')
      .select(
        'comm.id',
        'comm.rating',
        'comm.text',
        'comm.date_created',
        'comm.photo_id',
        db.raw(
          `row_to_json(
            (SELECT tmp FROM (
              SELECT
                usr.id,
                usr.user_name,
                usr.full_name,
                usr.date_created,
                usr.date_modified
            ) tmp)
          ) AS "user"`
        )
      )
      .leftJoin(
        'road_trippin_users AS usr',
        'comm.user_id',
        'usr.id',
      )
      .where('comm.id', id)
      .first()
  },

  insertComment(db, newComment) {
    return db
      .insert(newComment)
      .into('road_trippin_comments')
      .returning('*')
      .then(([comment]) => comment)
      .then(comment =>
        CommentsService.getById(db, comment.id)
      )
  },

  serializeComment(comment) {
    return {
      id: comment.id,
      rating: comment.rating,
      text: xss(comment.text),
      photo_id: comment.photo_id,
      date_created: comment.date_created,
      user: comment.user || {},
    }
  }
}

module.exports = CommentsService
