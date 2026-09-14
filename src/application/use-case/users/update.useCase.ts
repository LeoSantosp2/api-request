import {
  UserRepository,
  UpdateRequestUserData,
} from '../../../domain/entities/user.entity';

import { HttpError } from '../../../presentation/utils/http.error';

export class UpdateUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, user: UpdateRequestUserData, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para editar este usuário.',
      );
    }

    const userUpdated = {
      first_name: user.firstName.trim(),
      last_name: user.lastName.trim(),
    };

    await this.userRepository.update(id, userUpdated);
  }
}
