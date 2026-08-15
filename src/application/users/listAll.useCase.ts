import { UserRepository } from '../../domain/users/users';

export class ListAllUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute() {
    return await this.userRepository.listAll();
  }
}
