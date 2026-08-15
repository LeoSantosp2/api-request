import { hashPassword } from '../../src/utils/hash.password';
import { comparePassword } from '../../src/utils/compare.password';

describe('Testing hashPassword / comparePassword', () => {
  it('should return True when password matches the hash', () => {
    const passwordHash = hashPassword('12345678', 8);

    expect(comparePassword('12345678', passwordHash)).toEqual(true);
  });

  it('should return False when password does not match the hash', () => {
    const passwordHash = hashPassword('password100', 8);

    expect(comparePassword('123456789', passwordHash)).toEqual(false);
  });
});
