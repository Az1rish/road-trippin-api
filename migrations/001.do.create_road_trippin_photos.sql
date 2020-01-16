CREATE TABLE road_trippin_photos (
  id SERIAL PRIMARY KEY,
  image TEXT,
  title TEXT NOT NULL,
  location TEXT NOT NULL,
  description TEXT,
  date_created TIMESTAMP DEFAULT now() NOT NULL
);
