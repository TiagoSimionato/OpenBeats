import type { ScanDownloadedReleasesResponse } from 'backend/downloads/types';
import { rescanDownloadedReleases } from 'backend/downloads';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<Record<string, never>>;
};

export const POST = withErrorHandler(async (_request: Request, _context: RouteContext) => {
  const downloadedReleases = await rescanDownloadedReleases();

  return NextResponse.json<ScanDownloadedReleasesResponse>({
    downloadedReleases,
  });
});
