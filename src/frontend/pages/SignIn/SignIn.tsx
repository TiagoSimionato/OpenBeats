import { auth, signIn } from 'configs/auth';
import { ROUTES } from 'configs/routes';
import { Button } from 'frontend/ui/Button';
import { Input } from 'frontend/ui/Input';
import { CredentialsSignin } from 'next-auth';
import { redirect } from 'next/navigation';

export const SignInPage = async ({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) => {
  const callbackUrlParam = (await searchParams).callbackUrl ?? ROUTES.HOME;
  const callbackUrl = [...callbackUrlParam].join('');
  const session = await auth();

  if (session)
    redirect(ROUTES.HOME);

  return (
    <main className="flex grow flex-col items-center justify-center gap-8 p-10">
      <h1 className="text-start text-3xl font-semibold">OpenBeats</h1>
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
        className="flex flex-col gap-4"
      >
        <Input id="username" name="username" placeholder="Username" type="text" />
        <Input id="password" name="password" placeholder="Password" type="password" />
        <Button className="self-center rounded-4xl" size="lg" type="submit">
          Sign In
        </Button>
      </form>
    </main>
  );
};
