export interface UsersProps {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  tokenAuth: string | null;
  createdAt: Date;
  updatedAt: Date;
}

export interface UserRequestProps {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  confirmPassword: string;
}

export interface CreateUsersProps {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  password: string;
}
