export class HttpError extends Error {
  public readonly statusCode: number;
  public readonly isOperational: boolean;
  public readonly details: unknown;

  constructor(statusCode: number, message: string, details?: unknown) {
    super(message);

    this.statusCode = statusCode;
    this.details = details;
    this.isOperational = true;

    Object.setPrototypeOf(this, new.target.prototype);

    if (Error.captureStackTrace) {
      Error.captureStackTrace(this, this.constructor);
    }
  }
}

export class BadRequestError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(400, message, details);
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(401, message, details);
  }
}

export class ForbiddenError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(403, message, details);
  }
}

export class NotFoundError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(404, message, details);
  }
}

export class PayloadTooLargeError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(413, message, details);
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(429, message, details);
  }
}

export class InternalServerError extends HttpError {
  constructor(message: string, details?: unknown) {
    super(500, message, details);
  }
}
