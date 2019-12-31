CREATE TABLE road-trippin_users (
  id SERIAL PRIMARY KEY,
  user_name TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  password TEXT NOT NULL,
  date_created TIMESTAMP NOT NULL DEFAULT now(),
  date_modified TIMESTAMP
);

ALTER TABLE road-trippin_photos
  ADD COLUMN
    user_id INTEGER REFERENCES road-trippin_users(id)
    ON DELETE SET NULL;
