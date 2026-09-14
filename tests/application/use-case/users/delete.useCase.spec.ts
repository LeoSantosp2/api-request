import { mock, MockProxy } from 'jest-mock-extended';

import { DeleteUseCase } from '../../../../src/application/use-case/users/delete.useCase';
import { UserRepository } from '../../../../src/domain/entities/user.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

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
    expect(userRepository.delete).not.toHaveBeenCalled();
  });

  it('Should delete the user', async () => {
    userRepository.delete.mockResolvedValueOnce(undefined);

    await expect(deleteUseCase.execute('1', '1')).resolves.toBeUndefined();

    expect(userRepository.delete).toHaveBeenCalledWith('1');
  });
});
