import { UserRepository } from '../../../domain/entities/users.entity';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/http.error';

export class ListOneUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, userId?: string) {
    if (id !== userId) {
      throw new ForbiddenError(
        'Você não tem permissão para listar este usuário.',
      );
    }

    const user = await this.userRepository.listPublic(id);

    if (!user) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    return user;
  }
}
