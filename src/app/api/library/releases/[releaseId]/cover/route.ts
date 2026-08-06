import { withErrorHandler } from 'backend/exceptions/handler';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (_request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { releaseId } = await params;

    await libraryManagerService.addReleaseCover({ releaseId });

    return NextResponse.json('');
  },
);
