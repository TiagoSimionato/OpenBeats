import type { PropsWithChildren } from 'react';
import { Header } from './Header/Header';

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    {children}
  </>
);
