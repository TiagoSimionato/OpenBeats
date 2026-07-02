import { Providers } from 'frontend/providers';
import { Layout } from 'frontend/ui/Layout';

const AuthenticatedLayout = ({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) => (
  <Providers>
    <Layout>
      {children}
    </Layout>
  </Providers>
);

export default AuthenticatedLayout;
