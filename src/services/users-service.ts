import isEmail from 'validator/lib/isEmail';
import { v4 } from 'uuid';
import { hashSync, compareSync } from 'bcrypt';

import {
  index,
  show,
  showByEmail,
  store,
  update,
  IDelete,
} from '../repositories/users-repository';

import { HttpError } from '../utils/http-error';

import { UserRequestProps } from '../interfaces/users-props';

export const listAll = async () => await index();

export const listOne = async (id: string) => {
  const user = await show(id);

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  return user;
};

export const create = async (user: UserRequestProps) => {
  if (
    !user.firstName ||
    !user.lastName ||
    !user.email ||
    !user.password ||
    !user.confirmPassword
  ) {
    throw new HttpError(400, 'Os campos não podem estar vazios.');
  }

  if (!isEmail(user.email)) {
    throw new HttpError(400, 'E-mail inválido.');
  }

  const emailExists = await showByEmail(user.email);

  if (emailExists) {
    throw new HttpError(400, 'E-mail já cadastrado.');
  }

  if (user.password !== user.confirmPassword) {
    throw new HttpError(400, 'As senhas devem ser iguais.');
  }

  if (user.password.length < 8 || user.confirmPassword.length < 8) {
    throw new HttpError(400, 'A senha deve ter no minímo 8 caracteres.');
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

export const updateUser = async (user: UserRequestProps, id: string) => {
  const currentUser = await show(id);

  if (!currentUser) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  if (currentUser.first_name !== user.firstName) {
    currentUser.first_name = user.firstName;
  }

  if (currentUser.last_name !== user.lastName) {
    currentUser.last_name = user.lastName;
  }

  if (currentUser.email !== user.email) {
    const emailExists = await showByEmail(user.email);

    if (!isEmail(user.email)) {
      throw new HttpError(400, 'E-mail inválido.');
    }

    if (emailExists) {
      throw new HttpError(400, 'E-mail já cadastrado.');
    }

    currentUser.email = user.email;
  }

  if (!compareSync(user.password, currentUser.password)) {
    if (user.password !== user.confirmPassword) {
      throw new HttpError(400, 'As senhas devem ser iguais.');
    }

    if (user.password.length < 8 || user.confirmPassword.length < 8) {
      throw new HttpError(400, 'A senha deve ter no minímo 8 caracteres.');
    }

    currentUser.password = hashSync(user.password, 8);
  }

  await update(currentUser, id);
};

export const deleteUser = async (id: string) => {
  const user = await show(id);

  if (!user) {
    throw new HttpError(404, 'Usuário não encontrado.');
  }

  await IDelete(id);
};
