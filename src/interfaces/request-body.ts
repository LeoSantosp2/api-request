import { Request } from 'express';

export interface RequestBodyProps<T> extends Request {
  body: T;
  params: {
    id: string;
  };
}
