import type { PropsWithChildren } from 'react';
import { QueuePopup } from 'frontend/pages/ReleaseSearch/components/QueuePopup';
import { Header } from './Header/Header';

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    {children}
    <QueuePopup />
  </>
);
