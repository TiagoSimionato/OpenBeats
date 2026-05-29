import { ensureDownloadIndexReady, listDownloadedReleases } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const GET = withErrorHandler(async (_request: Request, _context: RouteContext) => {
  await ensureDownloadIndexReady();
  const downloadedReleases = await listDownloadedReleases();

  return NextResponse.json({
    downloadedReleases,
  });
});
