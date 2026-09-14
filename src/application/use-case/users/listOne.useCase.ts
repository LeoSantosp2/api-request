import { UserRepository } from '../../../domain/entities/user.entity';

import { HttpError } from '../../../presentation/utils/http.error';

export class ListOneUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para listar este usuário.',
      );
    }

    return await this.userRepository.listPublic(id);
  }
}
