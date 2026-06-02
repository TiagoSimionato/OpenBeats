import type { PropsWithChildren } from 'react';
import { Header } from './Header';

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    {children}
  </>
);
