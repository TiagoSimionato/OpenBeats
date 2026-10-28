import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/library';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { releaseId } = await params;

    await libraryManagerService.covers.addReleaseCover({ releaseId });

    return NextResponse.json('');
  },
);
