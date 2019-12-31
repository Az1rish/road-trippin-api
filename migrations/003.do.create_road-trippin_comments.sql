CREATE TABLE road-trippin_comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    photo_id INTEGER
        REFERENCES road-trippin_photos(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES road-trippin_users(id) ON DELETE CASCADE NOT NULL
);
