import { UserRepository } from '../../../domain/entities/users.entity';

import { HttpError } from '../../../presentation/utils/http.error';

export class DeleteUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para deletar este usuário.',
      );
    }

    const userExists = await this.userRepository.listOne(id);

    if (!userExists) {
      throw new HttpError(404, 'Usuário não encontrado.');
    }

    await this.userRepository.delete(id);
  }
}
