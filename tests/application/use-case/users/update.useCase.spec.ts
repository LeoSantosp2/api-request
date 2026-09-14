import { mock, MockProxy } from 'jest-mock-extended';

import { UpdateUseCase } from '../../../../src/application/use-case/users/update.useCase';
import { UserRepository } from '../../../../src/domain/entities/user.entity';
import { HttpError } from '../../../../src/presentation/utils/http.error';

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
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Should throw 403 when there is no authenticated user', async () => {
    const promise = updateUseCase.execute('1', {
      firstName: 'New',
      lastName: 'Name',
    });

    await expect(promise).rejects.toMatchObject({ statusCode: 403 });
    expect(userRepository.update).not.toHaveBeenCalled();
  });

  it('Should update the user and persist via the repository', async () => {
    await expect(
      updateUseCase.execute('1', { firstName: 'New', lastName: 'Name' }, '1'),
    ).resolves.toBeUndefined();

    expect(userRepository.update).toHaveBeenCalledWith('1', {
      first_name: 'New',
      last_name: 'Name',
    });
  });

  it('Should trim the name fields before persisting', async () => {
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
