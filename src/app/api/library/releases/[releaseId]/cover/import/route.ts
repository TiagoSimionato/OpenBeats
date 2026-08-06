import { withErrorHandler } from 'backend/exceptions/handler';
import { BadRequestError } from 'backend/exceptions/http';
import { libraryManagerService } from 'backend/services/libraryManager.service';
import { NextResponse } from 'next/server';

type RouteContext = {
  params: Promise<{
    releaseId: string;
  }>;
};

export const POST = withErrorHandler(
  async (request: Request, { params }: RouteContext): Promise<NextResponse> => {
    const { releaseId } = await params;

    const file = (await request.formData()).get('file');

    if (!(file instanceof File))
      throw new BadRequestError('File not received');
    if (!file.type.includes('image'))
      throw new BadRequestError('Received file is not an image');

    await libraryManagerService.importReleaseCover({ file, releaseId });

    return NextResponse.json('');
  },
);
