import { UserRepository } from '../../domain/users/user';

import { HttpError } from '../../utils/http.error';

export class DeleteUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para deletar este usuário.',
      );
    }

    await this.userRepository.delete(id);
  }
}
