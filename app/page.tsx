'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import MainMenu from '@/components/MainMenu/MainMenu';
import { getFilteredMenu } from '@/navigation/menu';
import getSessionOptions from '@/session/options';
import TSessionPayload from '@/types/session-payload';

export default async function HomePage() {
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());
  if (!session.user) {
    return redirect('/login');
  }

  const filteredMenu = await getFilteredMenu(session.user);
  return <MainMenu menu={filteredMenu} />;
}
