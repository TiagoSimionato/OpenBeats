import { getDownloadedRelease } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const GET = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  const downloadedRelease = await getDownloadedRelease(releaseId);

  if (!downloadedRelease)
    throw new NotFoundError('Release not found');

  return NextResponse.json({
    downloadedRelease,
  });
});
