import { auth, signIn } from 'auth';
import { Input } from 'frontend/ui/Input';
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
    <main className="p-10 flex flex-col items-center justify-center gap-8 grow">
      <h1 className="text-3xl font-semibold text-start">OpenBeats</h1>
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
        className="flex-col flex gap-4"
      >
        <Input
          id="username"
          name="username"
          placeholder="Username"
          type="text"
        />
        <Input
          id="password"
          name="password"
          placeholder="Password"
          type="password"
        />
        <button className="bg-primary rounded-4xl self-center font-bold px-7 py-2">Sign In</button>
      </form>
    </main>
  );
};
