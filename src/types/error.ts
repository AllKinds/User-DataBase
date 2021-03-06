export class ApplicationError extends Error {
  code: number;
  name: string;

  constructor(message?: string, code?: number) {
    super(message);
    Error.captureStackTrace(this, this.constructor);
    this.name = this.constructor.name;
    this.code = code || 500;
  }

  get status() {
    return this.code;
  }

  get statusCode() {
    return this.code;
  }
}

export class UnauthorizedError extends ApplicationError {
  static ERROR_MESSAGE = 'Unauthorized';
  constructor(message?: string) {
    super(message || UnauthorizedError.ERROR_MESSAGE, 401);
  }
}

export class ValidationError extends ApplicationError {
  constructor(message?: string) {
    super(message, 400);
  }
}

export class ResourceNotFoundError extends ApplicationError {
  constructor(message?: string) {
    super(message, 404);
  }
}
