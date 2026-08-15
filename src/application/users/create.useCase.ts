import { v4 } from 'uuid';

import { UserRepository, UserRequestData } from '../../domain/users/users';

import { HttpError } from '../../utils/http-error';
import { hashPassword } from '../../utils/hash.password';

export class CreateUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(user: UserRequestData) {
    const emailExists = await this.userRepository.showByEmail(user.email);

    if (emailExists) {
      throw new HttpError(400, 'Dados inválidos.');
    }

    const newUser = {
      id: v4(),
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password: hashPassword(user.password, 8),
    };

    await this.userRepository.create(newUser);
  }
}
