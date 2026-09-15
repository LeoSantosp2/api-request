import { mock, MockProxy } from 'jest-mock-extended';

import { ListOneUseCase } from '../../../../src/application/use-case/users/listOne.useCase';
import { UserRepository } from '../../../../src/domain/entities/users.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

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

  it('Should return the public user', async () => {
    userRepository.listPublic.mockResolvedValueOnce({
      id: '1',
      first_name: 'Leonardo',
      last_name: 'Santos',
      email: 'leonardo@email.com',
      created_at: new Date(),
      updated_at: new Date(),
    });

    const user = await listOneUseCase.execute('1', '1');

    expect(userRepository.listPublic).toHaveBeenCalledWith('1');
    expect(user).toMatchObject({ id: '1', email: 'leonardo@email.com' });
  });
});
