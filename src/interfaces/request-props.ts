import { Request } from 'express';

export interface RequestProps<T = undefined> extends Request {
  body: T;
  params: {
    id: string;
  };
}
