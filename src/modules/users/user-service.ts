import { v4 } from 'uuid';
import { hashSync, compareSync } from 'bcrypt';

import { repository } from './user-repository';

import { HttpError } from '../../utils/http-error';

import { UserRequest } from '../../types/users-props';

export const service = {
  async listAll() {
    const users = await repository.get();

    return users;
  },

  async listOne(id: string) {
    const user = await repository.showPublic(id);

    if (!user) {
      throw new HttpError(404, 'Usuário não encontrado ou não existe.');
    }

    return user;
  },

  async create(user: UserRequest) {
    const emailExists = await repository.showByEmail(user.email);

    if (emailExists) {
      throw new HttpError(400, 'Dados inválidos.');
    }

    const newUser = {
      id: v4(),
      first_name: user.firstName,
      last_name: user.lastName,
      email: user.email,
      password: hashSync(user.password, 8),
    };

    await repository.store(newUser);
  },

  async update(user: UserRequest, id: string, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para editar este usuário.',
      );
    }

    const currentUser = await repository.show(id);

    if (!currentUser) {
      throw new HttpError(404, 'Usuário não encontrado ou não existe.');
    }

    if (currentUser.first_name !== user.firstName) {
      currentUser.first_name = user.firstName;
    }

    if (currentUser.last_name !== user.lastName) {
      currentUser.last_name = user.lastName;
    }

    if (currentUser.email !== user.email) {
      const emailExists = await repository.showByEmail(user.email);

      if (emailExists) {
        throw new HttpError(400, 'Dados inválidos.');
      }

      currentUser.email = user.email;
    }

    if (!compareSync(user.password, currentUser.password)) {
      currentUser.password = hashSync(user.password, 8);
    }
  },

  async delete(id: string, userId?: string) {
    if (id !== userId) {
      throw new HttpError(
        403,
        'Você não tem permissão para deletar este usuário.',
      );
    }
  },
};
