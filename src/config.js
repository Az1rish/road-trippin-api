module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: 'https://road-trippin.now.sh',
  DATABASE_URL: process.env.DATABASE_URL || 'postgresql://road_trippin:road_trippin@localhost/road_trippin',
  TEST_DATABASE_URL: process.env.TEST_DATABASE_URL || 'postgresql://road_trippin:road_trippin@localhost/road_trippin_test',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
  API_BASE_URL: process.env.REACT_APP_API_BASE_URL || "http://localhost:3000/api",
}