import Knex from 'knex';

import env from './env';

const knexfile = {
  client: 'mysql2',
  connection: {
    host: env.DATABASE_HOST,
    port: env.DATABASE_PORT,
    database: env.DATABASE,
    user: env.DATABASE_USERNAME,
    password: env.DATABASE_PASSWORD,
  },
  pool: {
    min: 2,
    max: 10,
  },
  migrations: {
    tableName: 'knex_migrations',
  },
};

const knex = Knex(knexfile);

export default knex;
