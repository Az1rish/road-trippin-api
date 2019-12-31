CREATE TABLE road_trippin_comments (
    id SERIAL PRIMARY KEY,
    text TEXT NOT NULL,
    rating INTEGER NOT NULL,
    date_created TIMESTAMP DEFAULT now() NOT NULL,
    photo_id INTEGER
        REFERENCES road_trippin_photos(id) ON DELETE CASCADE NOT NULL,
    user_id INTEGER
        REFERENCES road_trippin_users(id) ON DELETE CASCADE NOT NULL
);
