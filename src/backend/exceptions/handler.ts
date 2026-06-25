import { NextResponse } from 'next/server';
import { HttpError } from './http';

export type ErrorResponseBody = {
  error: {
    code?: string;
    message: string;
    status: number;
  };
};

const toErrorResponse = (error: HttpError) => NextResponse.json<ErrorResponseBody>({
  error: {
    code: error.code,
    message: error.message,
    status: error.status,
  },
}, {
  status: error.status,
});

export const withErrorHandler = <TContext = Record<string, never>>(
  handler: (
    request: Request,
    context: TContext,
  ) => Promise<Response> | Response,
) => async (request: Request, context: TContext) => {
  try {
    return await handler(request, context);
  }
  catch (error) {
    if (error instanceof HttpError)
      return toErrorResponse(error);
    throw error;
  }
};

export const throwError = (error: HttpError) => {
  throw error;
};
