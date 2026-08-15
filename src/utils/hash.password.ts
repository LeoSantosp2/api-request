import { hashSync } from 'bcrypt';

export const hashPassword = (password: string, salt: number) =>
  hashSync(password, salt);
