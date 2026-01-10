import 'reflect-metadata';
import '@mantine/core/styles.css';
import '@mantine/dates/styles.css';
import '@mantine/spotlight/styles.css';
import '@mantine/notifications/styles.css';
import './global.css';

import React, { Suspense } from 'react';
import { ColorSchemeScript, mantineHtmlProps, MantineProvider } from '@mantine/core';
import { Notifications } from '@mantine/notifications';
import { theme } from '../theme';

import { cookies } from 'next/headers';
import { getIronSession } from 'iron-session';
import { AppShellLayout } from '@/components/AppShellLayout/AppShellLayout';
import { ViewportGuard } from '@/components/ViewportGuard/ViewportGuard';
import interFont from '@/fonts/inter-font';
import { getFilteredMenu } from '@/navigation/menu';
import getSessionOptions from '@/session/options';
import TSessionPayload from '@/types/session-payload';
import Providers from '@/components/Providers/Providers';

export const metadata = {
  title: 'B@ncs Crest',
  description: 'B@ncs 24 Web App',
};

export default async function RootLayout({ children }: { children: any }) {
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());

  return (
    <html lang="en" {...mantineHtmlProps} className={interFont.variable}>
      <head>
        <ColorSchemeScript />
        <link rel="shortcut icon" href="/favicon.svg" />
        <meta
          name="viewport"
          content="minimum-scale=1, initial-scale=1, width=device-width, user-scalable=no"
        />
      </head>
      <body>
        <Providers>
          <MantineProvider theme={theme}>
            <Notifications />
            <ViewportGuard>
                <Suspense fallback={<div>Loading...</div>}>
                  {session.user ? (
                    <AppShellLayout menu={await getFilteredMenu(session.user)}>
                      {children}
                    </AppShellLayout>
                  ) : (
                    children
                  )}
                </Suspense>
            </ViewportGuard>
          </MantineProvider>
        </Providers>
      </body>
    </html>
  );
}
