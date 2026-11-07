import { v4 } from 'uuid';

import {
  UserRepository,
  CreateUserRequestData,
} from '../../../domain/entities/users.entity';
import { BadRequestError } from '../../../domain/errors/http.error';

import { hashPassword } from '../../../presentation/utils/hash.password';

export class CreateUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(user: CreateUserRequestData) {
    const emailExists = await this.userRepository.showByEmail(user.email);

    if (emailExists) {
      throw new BadRequestError('Dados inválidos.');
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
