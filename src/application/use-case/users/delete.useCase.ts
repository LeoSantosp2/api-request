import { UserRepository } from '../../../domain/entities/users.entity';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/http.error';

export class DeleteUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new ForbiddenError(
        'Você não tem permissão para deletar este usuário.',
      );
    }

    const userExists = await this.userRepository.listOne(id);

    if (!userExists) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    await this.userRepository.delete(id);
  }
}
