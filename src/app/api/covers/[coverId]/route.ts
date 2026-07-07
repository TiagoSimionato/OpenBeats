import { readFile } from 'node:fs/promises';
import { withErrorHandler } from 'backend/exceptions/handler';
import { BadRequestError, NotFoundError } from 'backend/exceptions/http';
import { CONFIGS } from 'configs/constants';

type RouteContext = {
  params: Promise<{
    coverId: string;
  }>;
};

export const GET = withErrorHandler(
  async (_request: Request, context: RouteContext) => {
    const params = await context.params;

    if (params.coverId.length !== 36)
      throw new BadRequestError('Malformed id');

    const imageBuffer = await readFile(`${CONFIGS.COVERS_PATH}/${params.coverId}.jpg`).catch((_) => {
      throw new NotFoundError('Image not found');
    });

    return new Response(imageBuffer, {
      headers: {
        'Content-Type': 'image/jpg',
      },
    });
  },
);
