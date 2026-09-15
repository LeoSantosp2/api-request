import { UserRepository } from '../../../domain/entities/users.entity';

export class ListAllUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute() {
    return await this.userRepository.listAll();
  }
}
