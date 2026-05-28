export class HttpError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status = 500, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', code?: string) {
    super(message, 400, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, 401, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, 403, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', code?: string) {
    super(message, 404, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', code?: string) {
    super(message, 409, code);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable Entity', code?: string) {
    super(message, 422, code);
    this.name = 'UnprocessableEntityError';
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too Many Requests', code?: string) {
    super(message, 429, code);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', code?: string) {
    super(message, 500, code);
    this.name = 'InternalServerError';
  }
}
