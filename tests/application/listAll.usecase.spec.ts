import { mock, MockProxy } from 'jest-mock-extended';

import { ListAllUseCase } from '../../src/application/users/listAll.useCase';
import { UserRepository } from '../../src/domain/users/users';

describe('Testing ListAllUseCase', () => {
  let userRepository: MockProxy<UserRepository>;
  let listAllUseCase: ListAllUseCase;

  beforeEach(() => {
    jest.clearAllMocks();
    userRepository = mock<UserRepository>();
    listAllUseCase = new ListAllUseCase(userRepository);
  });

  it('Should return all users', async () => {
    userRepository.listAll.mockResolvedValueOnce([]);

    const users = await listAllUseCase.execute();

    expect(users).toEqual([]);
    expect(userRepository.listAll).toHaveBeenCalledTimes(1);
  });
});
