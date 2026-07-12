import { compareSync } from 'bcrypt';

export const passwordIsValid = (password: string, passwordHash: string) =>
  compareSync(password, passwordHash);
