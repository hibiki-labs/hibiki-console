'use server';

import { cookies } from 'next/headers';
import { notFound, redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import { Container, SimpleGrid, Title } from '@mantine/core';
import ItemCard from '@/components/ItemCard/ItemCard';
import { getFilteredMenu } from '@/navigation/menu';
import getSessionOptions from '@/session/options';
import TSessionPayload from '@/types/session-payload';

export default async function MenuPage({
  params,
}: {
  params: Promise<{
    menu_item_id: string;
  }>;
}) {
  const { menu_item_id: menuItemId } = await params;
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());
  if (!session.user) {
    redirect('/login');
  }

  const filteredMenu = await getFilteredMenu(session.user);
  const menuItem = filteredMenu.find((item) => item.id === menuItemId);
  if (!menuItem) {
    return notFound();
  }
  const subMenuItems = menuItem.subMenu.map((item) => ({
    id: item.id,
    title: item.title,
  }));

  return (
    <Container fluid h="100%" p="xl">
      <Title order={2} mb="lg">
        {menuItem.title}
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {subMenuItems?.map((subMenuItem) => (
          <ItemCard
            key={subMenuItem.id}
            type="submenu-item"
            item={subMenuItem}
            menuId={menuItem.id}
          />
        ))}
      </SimpleGrid>
    </Container>
  );
}
