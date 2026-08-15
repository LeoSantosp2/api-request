import { UserRepository, UserRequestData } from '../../domain/users/user';

import { HttpError } from '../../utils/http.error';
import { hashPassword } from '../../utils/hash.password';
import { comparePassword } from '../../utils/compare.password';

export class UpdateUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, user: UserRequestData, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para editar este usuário.',
      );
    }

    const currentUser = await this.userRepository.listOne(id);

    if (!currentUser) {
      throw new HttpError(404, 'Usuário não encontrado ou não existe.');
    }

    if (currentUser.first_name !== user.firstName) {
      currentUser.first_name = user.firstName;
    }

    if (currentUser.last_name !== user.lastName) {
      currentUser.last_name = user.lastName;
    }

    if (currentUser.email !== user.email) {
      const emailExists = await this.userRepository.showByEmail(user.email);

      if (emailExists) {
        throw new HttpError(400, 'Dados inválidos.');
      }

      currentUser.email = user.email;
    }

    if (!comparePassword(user.password, currentUser.password)) {
      currentUser.password = hashPassword(user.password, 8);
    }

    await this.userRepository.update(id, currentUser);
  }
}
