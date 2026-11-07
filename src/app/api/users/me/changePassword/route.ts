import type { NextRequest } from 'next/server';
import { HttpStatusCode } from 'axios';
import { withErrorHandler } from 'backend/exceptions/handler';
import { ChangePasswordRequest } from 'backend/requests/changePassword.dto';
import { userService } from 'backend/services/user.service';
import { buildDTO, getSession } from 'backend/utils';
import { NextResponse } from 'next/server';

export const POST = withErrorHandler(
  async (request: NextRequest) => {
    const session = await getSession();

    const changePasswordRequest = await buildDTO(ChangePasswordRequest, await request.json());

    await userService.changeUserPassword(session.user?.name ?? '', changePasswordRequest);

    return NextResponse.json('', {
      status: HttpStatusCode.Ok,
    });
  },
);
