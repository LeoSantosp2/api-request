import { hashSync } from 'bcrypt';

import { passwordIsValid } from '../../utils/password-is-valid';

describe('Testing passwordIsValid function', () => {
  it('should return True when password matches the hash', () => {
    const passwordHash = hashSync('12345678', 8);

    const isValid = passwordIsValid('12345678', passwordHash);

    expect(isValid).toEqual(true);
  });

  it('Should return False when password does not match the hash', () => {
    const passwordHash = hashSync('password100', 8);

    const isValid = passwordIsValid('123456789', passwordHash);

    expect(isValid).toEqual(false);
  });
});
