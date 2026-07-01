export { auth as proxy } from 'auth';

export const config = {
  matcher: ['/((?!signin|api/auth|favicon.ico|_next/static|_next/image|.*\\.png$).*)'],
};
