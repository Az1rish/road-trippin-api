# Road Trippin' API

## Setting Up

- Install dependencies: `npm install`
- Create development and test databases: `createdb road-trippin`, `createdb road-trippin-test`
- Create database user: `createuser road-trippin`
- Grant privileges to new user in `psql`:
  - `GRANT ALL PRIVILEGES ON DATABASE road-trippin TO road-trippin`
  - `GRANT ALL PRIVILEGES ON DATABASE "road-trippin-test" TO road-trippin`
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

- To seed the database for development: `psql -U road-trippin -d road-trippin -a -f seeds/seed.road-trippin_tables.sql`
- To clear seed data: `psql -U road-trippin -d road-trippin -a -f seeds/trunc.road-trippin_tables.sql`

## Scripts

- Start application for development: `npm run dev`
- Run tests: `npm test`