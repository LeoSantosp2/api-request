import { v4 } from 'uuid';
import { hashSync, compareSync } from 'bcrypt';

import {
  index,
  show,
  showPublic,
  showByEmail,
  store,
  update,
  IDelete,
} from '../repositories/users-repository';

import { HttpError } from '../utils/http-error';

import { UserRequestProps } from '../interfaces/users-props';

export const listAll = async () => await index();

export const listOne = async (id: string) => {
  const user = await showPublic(id);

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  return user;
};

export const create = async (user: UserRequestProps) => {
  const emailExists = await showByEmail(user.email);

  if (emailExists) {
    throw new HttpError(400, 'E-mail já cadastrado.');
  }

  const newUser = {
    id: v4(),
    first_name: user.firstName,
    last_name: user.lastName,
    email: user.email,
    password: hashSync(user.password, 8),
  };

  await store(newUser);
};

export const updateUser = async (
  user: UserRequestProps,
  id: string,
  requesterId?: string,
) => {
  const currentUser = await show(id);

  if (!currentUser) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  if (requesterId !== id) {
    throw new HttpError(
      403,
      'Você não tem permissão para alterar este usuário.',
    );
  }

  if (currentUser.first_name !== user.firstName) {
    currentUser.first_name = user.firstName;
  }

  if (currentUser.last_name !== user.lastName) {
    currentUser.last_name = user.lastName;
  }

  if (currentUser.email !== user.email) {
    const emailExists = await showByEmail(user.email);

    if (emailExists) {
      throw new HttpError(400, 'E-mail já cadastrado.');
    }

    currentUser.email = user.email;
  }

  if (!compareSync(user.password, currentUser.password)) {
    currentUser.password = hashSync(user.password, 8);
  }

  await update(currentUser, id);
};

export const deleteUser = async (id: string, requesterId?: string) => {
  const user = await show(id);

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  if (requesterId !== id) {
    throw new HttpError(
      403,
      'Você não tem permissão para deletar este usuário.',
    );
  }

  await IDelete(id);
};
