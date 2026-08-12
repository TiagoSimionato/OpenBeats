import { HttpStatusCode } from 'axios';
import { runRsgain } from 'backend/binaries/rsgain';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

export const POST = withErrorHandler(
  async (_request: Request): Promise<NextResponse> => {
    runRsgain({ title: 'Entire library' });

    return NextResponse.json('', { status: HttpStatusCode.Accepted });
  },
);
