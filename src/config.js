module.exports = {
  PORT: process.env.PORT || 8000,
  NODE_ENV: process.env.NODE_ENV || 'development',
  CLIENT_ORIGIN: '',
  DB_URL: process.env.DB_URL || 'postgresql://road_trippin:road_trippin@localhost/road_trippin',
  JWT_SECRET: process.env.JWT_SECRET || 'change-this-secret',
}