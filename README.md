# Road Trippin' API

## Setting Up

- Install dependencies: `npm install`
- Create development and test databases: `createdb road_trippin`, `createdb road_trippin_test`
- Create database user: `createuser road_trippin`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE road_trippin TO road_trippin`
  - `GRANT ALL PRIVILEGES ON DATABASE "road_trippin_test" TO road_trippin`
- Prepare environment file: `cp example.env .env`
- Replace values in `.env` with your custom values.
- Bootstrap development database: `npm run migrate`
- Bootstrap test database: `npm run migrate:test`

### Configuring Postgres

For tests involving time to run properly, your Postgres database must be configured to run in the UTC timezone.

1. Locate the `postgresql.conf` file for your Postgres installation.
    - OS X, Homebrew: `/usr/local/var/postgres/postgresql.conf`
2. Uncomment the `timezone` line and set it to `UTC` as follows:

```
# - Locale and Formatting -

datestyle = 'iso, mdy'
#intervalstyle = 'postgres'
timezone = 'UTC'
#timezone_abbreviations = 'Default'     # Select the set of available time zone
```

## Sample Data

- To seed the database for development: `psql -U road_trippin -d road_trippin -a -f seeds/seed.road_trippin_tables.sql`
- To clear seed data: `psql -U road_trippin -d road_trippin -a -f seeds/trunc.road_trippin_tables.sql`

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`