export interface User {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
  created_at: Date;
  updated_at: Date;
}

export type UserPublic = Omit<User, 'password'>;

export interface CreateUserData {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}

export interface UserRequestData {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export type UpdateUserData = Omit<CreateUserData, 'id'>;

export interface UserRepository {
  listAll: () => Promise<UserPublic[]>;
  listOne: (id: string) => Promise<User | null>;
  listPublic: (id: string) => Promise<UserPublic | null>;
  showByEmail: (email: string) => Promise<User | null>;
  create: (newUser: CreateUserData) => Promise<void>;
  update: (id: string, user: UpdateUserData) => Promise<void>;
  delete: (id: string) => Promise<void>;
}
