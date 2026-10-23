import { UserRepository } from '../../../domain/entities/users.entity';

import { Forbidden, NotFound } from '../../../domain/errors/http.error';

export class DeleteUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new Forbidden('Você não tem permissão para deletar este usuário.');
    }

    const userExists = await this.userRepository.listOne(id);

    if (!userExists) {
      throw new NotFound('Usuário não encontrado.');
    }

    await this.userRepository.delete(id);
  }
}
