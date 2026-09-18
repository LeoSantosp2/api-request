import { mock, MockProxy } from 'jest-mock-extended';

import { UpdateUseCase } from '../../../../src/application/use-case/users/update.useCase';
import {
  User,
  UserRepository,
} from '../../../../src/domain/entities/users.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

const existingUser: User = {
  id: '1',
  first_name: 'Old',
  last_name: 'Name',
  email: 'leonardo@email.com',
  password: 'hashed',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Testing UpdateUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let updateUseCase: UpdateUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    updateUseCase = new UpdateUseCase(userRepository);
  });

  it('Should throw 403 when requester is not the target user', async () => {
    const promise = updateUseCase.execute(
      '1',
      { firstName: 'New', lastName: 'Name' },
      'someone-else',
    );

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Should throw 403 when there is no authenticated user', async () => {
    const promise = updateUseCase.execute('1', {
      firstName: 'New',
      lastName: 'Name',
    });

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Should throw 403 before revealing that the user does not exist', async () => {
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = updateUseCase.execute(
      'missing-id',
      { firstName: 'New', lastName: 'Name' },
      'someone-else',
    );

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
  });

  it('Should throw 404 when the user does not exist', async () => {
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = updateUseCase.execute(
      '1',
      { firstName: 'New', lastName: 'Name' },
      '1',
    );

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Should update the user and persist via the repository', async () => {
    userRepository.listOne.mockResolvedValueOnce(existingUser);

    await expect(
      updateUseCase.execute('1', { firstName: 'New', lastName: 'Name' }, '1'),
    ).resolves.toBeUndefined();

    expect(userRepository.listOne).toHaveBeenCalledWith('1');
    expect(userRepository.update).toHaveBeenCalledWith('1', {
      first_name: 'New',
      last_name: 'Name',
    });
  });

  it('Should trim the name fields before persisting', async () => {
    userRepository.listOne.mockResolvedValueOnce(existingUser);

    await updateUseCase.execute(
      '1',
      { firstName: '  New  ', lastName: '  Name  ' },
      '1',
    );

    expect(userRepository.update).toHaveBeenCalledWith('1', {
      first_name: 'New',
      last_name: 'Name',
    });
  });
});
