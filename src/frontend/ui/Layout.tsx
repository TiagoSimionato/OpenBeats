import type { PropsWithChildren } from 'react';
import { QueuePopup } from 'frontend/pages/ReleaseSearch/components/QueuePopup';
import { Header } from './Header/Header';
import { QueuePadding } from './QueuePadding';

export const Layout = ({ children }: PropsWithChildren) => (
  <>
    <Header />
    {children}
    <QueuePadding />
    <QueuePopup />
  </>
);
