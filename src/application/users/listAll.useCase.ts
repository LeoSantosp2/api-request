import { UserRepository } from '../../domain/users/user';

export class ListAllUseCase {
  constructor(protected readonly userRepository: UserRepository) {}

  async execute() {
    return await this.userRepository.listAll();
  }
}
