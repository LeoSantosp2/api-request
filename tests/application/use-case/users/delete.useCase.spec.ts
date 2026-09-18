import { mock, MockProxy } from 'jest-mock-extended';

import { DeleteUseCase } from '../../../../src/application/use-case/users/delete.useCase';
import {
  User,
  UserRepository,
} from '../../../../src/domain/entities/users.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

const existingUser: User = {
  id: '1',
  first_name: 'Leonardo',
  last_name: 'Santos',
  email: 'leonardo@email.com',
  password: 'hashed',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Testing DeleteUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let deleteUseCase: DeleteUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    deleteUseCase = new DeleteUseCase(userRepository);
  });

  it('Should throw 403 when requester is not the target user', async () => {
    const promise = deleteUseCase.execute('1', 'someone-else');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('Should throw 403 when there is no authenticated user', async () => {
    const promise = deleteUseCase.execute('1');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('Should throw 403 before revealing that the user does not exist', async () => {
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = deleteUseCase.execute('missing-id', 'someone-else');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listOne).not.toHaveBeenCalled();
  });

  it('Should throw 404 when the user does not exist', async () => {
    userRepository.listOne.mockResolvedValueOnce(null);

    const promise = deleteUseCase.execute('1', '1');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('Should delete the user', async () => {
    userRepository.listOne.mockResolvedValueOnce(existingUser);
    userRepository.delete.mockResolvedValueOnce(undefined);

    await expect(deleteUseCase.execute('1', '1')).resolves.toBeUndefined();

    expect(userRepository.listOne).toHaveBeenCalledWith('1');
    expect(userRepository.delete).toHaveBeenCalledWith('1');
  });
});
