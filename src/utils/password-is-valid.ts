import { compareSync } from 'bcrypt';

import knex from '../config/knex';

export const passwordIsValid = async (email: string, password: string) => {
  const user = await knex('users')
    .select('password')
    .where('email', '=', email);

  return compareSync(password, user[0].password);
};
