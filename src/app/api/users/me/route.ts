import type { User } from 'common/types/requests/user';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { NotFoundError } from 'backend/exceptions/http';
import { userService } from 'backend/services/user.service';
import { getSession } from 'backend/utils';
import { NextResponse } from 'next/server';

export const GET = withErrorHandler(
  async (_request: Request): Promise<NextResponse<Partial<User>>> => {
    const session = await getSession();

    const user = await userService.getUser(session.user?.name ?? '');

    if (!user)
      throw new NotFoundError();

    return NextResponse.json(user, {
      status: HttpStatusCode.Ok,
    });
  },
);
