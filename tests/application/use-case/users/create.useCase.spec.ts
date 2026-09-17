import { mock, MockProxy } from 'jest-mock-extended';

import { CreateUseCase } from '../../../../src/application/use-case/users/create.useCase';
import { UserRepository } from '../../../../src/domain/entities/users.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

jest.mock('uuid', () => ({
  v4: () => 'fixed-uuid',
}));

jest.mock('../../../../src/presentation/utils/hash.password', () => ({
  hashPassword: jest.fn(() => 'hashed-password'),
}));

describe('Testing CreateUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let createUseCase: CreateUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    createUseCase = new CreateUseCase(userRepository);
  });

  it('Should throw 400 when email already exists', async () => {
    userRepository.showByEmail.mockResolvedValueOnce({
      id: 'existing',
      first_name: 'A',
      last_name: 'B',
      email: 'leonardo@email.com',
      password: 'hashed',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const promise = createUseCase.execute({
      firstName: 'Leonardo',
      lastName: 'Santos',
      email: 'leonardo@email.com',
      password: '12345678',
      confirmPassword: '12345678',
    });

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 400 });
    expect(userRepository.create).not.toHaveBeenCalled();
  });

  it('Should create a user', async () => {
    userRepository.showByEmail.mockResolvedValueOnce(null);

    await expect(
      createUseCase.execute({
        firstName: 'Leonardo',
        lastName: 'Santos',
        email: 'leonardo@email.com',
        password: '12345678',
        confirmPassword: '12345678',
      }),
    ).resolves.toBeUndefined();

    expect(userRepository.create).toHaveBeenCalledWith({
      id: 'fixed-uuid',
      first_name: 'Leonardo',
      last_name: 'Santos',
      email: 'leonardo@email.com',
      password: 'hashed-password',
    });
  });
});
