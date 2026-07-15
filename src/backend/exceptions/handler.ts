import type { NextRequest } from 'next/server';
import { HttpStatusCode } from 'axios';
import { ValidationError } from 'class-validator';
import { NextResponse } from 'next/server';
import { HttpError } from './http';

export type ErrorResponseBody = {
  error: {
    code?: string;
    message: string;
    status: number;
  };
};

const toErrorResponse = (error: HttpError | ValidationError): NextResponse<ErrorResponseBody> => {
  const body: ErrorResponseBody = error instanceof HttpError
    ? {
        error: {
          code: error.code,
          message: error.message,
          status: error.status,
        },
      }
    : {
        error: {
          message: Object.values(error.constraints ?? []).join('; '),
          status: HttpStatusCode.BadRequest,
        },
      };
  return NextResponse.json<ErrorResponseBody>(body, {
    status: body.error.status,
  });
};

export const withErrorHandler = <TContext = Record<string, never>>(
  handler: (
    request: NextRequest,
    context: TContext,
  ) => Promise<Response> | Response,
) => async (request: NextRequest, context: TContext) => {
  try {
    return await handler(request, context);
  }
  catch (error) {
    if (error instanceof HttpError)
      return toErrorResponse(error);
    if (Array.isArray(error) && error.every(it => it instanceof ValidationError)) {
      return toErrorResponse(error[0]);
    }
    throw error;
  }
};

export const throwError = (error: HttpError) => {
  throw error;
};
