import { compareSync } from 'bcrypt';

export const comparePassword = (password: string, passwordHash: string) =>
  compareSync(password, passwordHash);
