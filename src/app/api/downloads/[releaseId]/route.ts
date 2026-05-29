import { ensureDownloadIndexReady, getDownloadedRelease } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const GET = withErrorHandler(async (_request: Request, { params }: RouteContext) => {
  const { releaseId } = await params;
  await ensureDownloadIndexReady();
  const downloadedRelease = await getDownloadedRelease(releaseId);

  if (!downloadedRelease) {
    throw new NotFoundError('Downloaded release not found');
  }

  return NextResponse.json({
    downloadedRelease,
  });
});
