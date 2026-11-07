import {
  UserRepository,
  UpdateRequestUserData,
} from '../../../domain/entities/users.entity';
import {
  ForbiddenError,
  NotFoundError,
} from '../../../domain/errors/http.error';

export class UpdateUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute(id: string, user: UpdateRequestUserData, userId?: string) {
    if (id !== userId) {
      throw new ForbiddenError(
        'Você não tem permissão para editar este usuário.',
      );
    }

    const userExists = await this.userRepository.listOne(id);

    if (!userExists) {
      throw new NotFoundError('Usuário não encontrado.');
    }

    const userUpdated = {
      first_name: user.firstName.trim(),
      last_name: user.lastName.trim(),
    };

    await this.userRepository.update(id, userUpdated);
  }
}
