import { mock, MockProxy } from 'jest-mock-extended';

import { UpdateUseCase } from '../../src/application/users/update.useCase';
import { UserRepository, User } from '../../src/domain/users/users';
import { HttpError } from '../../src/utils/http.error';

jest.mock('../../src/utils/hash.password', () => ({
  hashPassword: jest.fn(() => 'hashed-new-password'),
}));

jest.mock('../../src/utils/compare.password', () => ({
  comparePassword: jest.fn(),
}));

describe('Testing UpdateUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let updateUseCase: UpdateUseCase;

  const existingUser: User = {
    id: '1',
    first_name: 'Old',
    last_name: 'Name',
    email: 'old@email.com',
    password: 'hashed-password',
    created_at: new Date(),
    updated_at: new Date(),
  };

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    updateUseCase = new UpdateUseCase(userRepository);
  });

  it('Should throw 403 when requester is not the target user', async () => {
    const promise = updateUseCase.execute(
      '1',
      {
        firstName: 'New',
        lastName: 'Name',
        email: 'old@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      'someone-else',
    );

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
  });

  it('Should throw 404 when user does not exist', async () => {
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = updateUseCase.execute(
      '1',
      {
        firstName: 'New',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      '1',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
  });

  it('Should throw 400 when the new email already belongs to another user', async () => {
    userRepository.listOne.mockResolvedValueOnce({ ...existingUser });
    userRepository.showByEmail.mockResolvedValueOnce({
      ...existingUser,
      id: 'other',
      email: 'new@email.com',
    });

    const promise = updateUseCase.execute(
      '1',
      {
        firstName: 'Old',
        lastName: 'Name',
        email: 'new@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      },
      '1',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
  });

  it('Should update the user and persist via the repository', async () => {
    const { comparePassword } = jest.requireMock(
      '../../src/utils/compare.password',
    );
    (comparePassword as jest.Mock).mockReturnValueOnce(false);

    userRepository.listOne.mockResolvedValueOnce({ ...existingUser });

    await expect(
      updateUseCase.execute(
        '1',
        {
          firstName: 'New',
          lastName: 'Name',
          email: 'old@email.com',
          password: '12345678',
          confirmPassword: '12345678',
        },
        '1',
      ),
    ).resolves.toBeUndefined();

    expect(userRepository.update).toHaveBeenCalledWith(
      '1',
      expect.objectContaining({
        first_name: 'New',
        last_name: 'Name',
        email: 'old@email.com',
        password: 'hashed-new-password',
      }),
    );
  });
});
