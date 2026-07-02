import { auth, signIn } from 'auth';
import { CredentialsSignin } from 'next-auth';
import { redirect } from 'next/navigation';

export const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const callbackUrlParam = (await searchParams).callbackUrl ?? '/';
  const callbackUrl = [...callbackUrlParam].join('');
  const session = await auth();

  if (session)
    redirect('/');

  return (
    <form
      action={async (formData) => {
        'use server';
        try {
          await signIn('credentials', {
            password: formData.get('password')?.toString() ?? '',
            redirect: false,
            username: formData.get('username')?.toString() ?? '',
          });
          redirect(callbackUrl);
        }
        catch (error) {
          if (error instanceof CredentialsSignin) {
            console.log('Invalid Credentials');
            return;
          }
          throw error;
        }
      }}
      className="flex-col flex p-10 gap-4"
    >
      <label htmlFor="username">
        Username
      </label>
      <input className="border-amber-50 border-2 rounded-md" id="username" name="username" type="text" />
      <label htmlFor="password">
        Password
      </label>
      <input className="border-amber-50 border-2 rounded-md" id="password" name="password" type="password" />
      <button>Sign In</button>
    </form>
  );
};
