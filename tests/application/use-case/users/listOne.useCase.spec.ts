import { mock, MockProxy } from 'jest-mock-extended';

import { ListOneUseCase } from '../../../../src/application/use-case/users/listOne.useCase';
import {
  UserPublic,
  UserRepository,
} from '../../../../src/domain/entities/users.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

const publicUser: UserPublic = {
  id: '1',
  first_name: 'Leonardo',
  last_name: 'Santos',
  email: 'leonardo@email.com',
  created_at: new Date(),
  updated_at: new Date(),
};

describe('Testing ListOneUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let listOneUseCase: ListOneUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    listOneUseCase = new ListOneUseCase(userRepository);
  });

  it('Should throw 403 when requester is not the target user', async () => {
    const promise = listOneUseCase.execute('1', 'someone-else');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listPublic).not.toHaveBeenCalled();
  });

  it('Should throw 403 when there is no authenticated user', async () => {
    const promise = listOneUseCase.execute('1');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listPublic).not.toHaveBeenCalled();
  });

  it('Should throw 403 before revealing that the user does not exist', async () => {
    userRepository.listPublic.mockResolvedValueOnce(null);

    const promise = listOneUseCase.execute('missing-id', 'someone-else');

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.listPublic).not.toHaveBeenCalled();
  });

  it('Should throw 404 when the user does not exist', async () => {
    userRepository.listPublic.mockResolvedValueOnce(null);

    const promise = listOneUseCase.execute('1', '1');

    await expect(promise).rejects.toBeInstanceOf(HttpError);
    await expect(promise).rejects.toMatchObject({ statusCode: 404 });
  });

  it('Should return the public user', async () => {
    userRepository.listPublic.mockResolvedValueOnce(publicUser);

    const user = await listOneUseCase.execute('1', '1');

    expect(userRepository.listPublic).toHaveBeenCalledWith('1');
    expect(user).toMatchObject({ id: '1', email: 'leonardo@email.com' });
  });
});
