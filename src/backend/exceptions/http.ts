import { HttpStatusCode } from 'axios';

export class HttpError extends Error {
  code?: string;
  status: number;

  constructor(message: string, status = HttpStatusCode.InternalServerError, code?: string) {
    super(message);
    this.name = 'HttpError';
    this.status = status;
    this.code = code;
  }
}

export class BadRequestError extends HttpError {
  constructor(message = 'Bad Request', code?: string) {
    super(message, HttpStatusCode.BadRequest, code);
    this.name = 'BadRequestError';
  }
}

export class UnauthorizedError extends HttpError {
  constructor(message = 'Unauthorized', code?: string) {
    super(message, HttpStatusCode.Unauthorized, code);
    this.name = 'UnauthorizedError';
  }
}

export class ForbiddenError extends HttpError {
  constructor(message = 'Forbidden', code?: string) {
    super(message, HttpStatusCode.Forbidden, code);
    this.name = 'ForbiddenError';
  }
}

export class NotFoundError extends HttpError {
  constructor(message = 'Not Found', code?: string) {
    super(message, HttpStatusCode.NotFound, code);
    this.name = 'NotFoundError';
  }
}

export class ConflictError extends HttpError {
  constructor(message = 'Conflict', code?: string) {
    super(message, HttpStatusCode.Conflict, code);
    this.name = 'ConflictError';
  }
}

export class UnprocessableEntityError extends HttpError {
  constructor(message = 'Unprocessable Entity', code?: string) {
    super(message, HttpStatusCode.UnprocessableEntity, code);
    this.name = 'UnprocessableEntityError';
  }
}

export class TooManyRequestsError extends HttpError {
  constructor(message = 'Too Many Requests', code?: string) {
    super(message, HttpStatusCode.TooManyRequests, code);
    this.name = 'TooManyRequestsError';
  }
}

export class InternalServerError extends HttpError {
  constructor(message = 'Internal Server Error', code?: string) {
    super(message, HttpStatusCode.InternalServerError, code);
    this.name = 'InternalServerError';
  }
}
