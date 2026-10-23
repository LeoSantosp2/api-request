export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;

  constructor(statusCode: number, message: string) {
    super(message);

    this.statusCode = statusCode;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequest extends HttpError {
  constructor(message: string) {
    super(400, message);
  }
}

export class Unauthorized extends HttpError {
  constructor(message: string) {
    super(401, message);
  }
}

export class Forbidden extends HttpError {
  constructor(message: string) {
    super(403, message);
  }
}

export class NotFound extends HttpError {
  constructor(message: string) {
    super(404, message);
  }
}

export class TooManyRequests extends HttpError {
  constructor(message: string) {
    super(429, message);
  }
}
