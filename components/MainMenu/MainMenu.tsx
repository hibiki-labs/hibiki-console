'use client';

import { Container, SimpleGrid, Title } from '@mantine/core';
import { MenuItem } from '@/types/navigation';
import ItemCard from '../ItemCard/ItemCard';

export default function MainMenu({ menu }: { menu: MenuItem[] }) {
  const items = menu.map((menuItem) => (
    <ItemCard key={menuItem.id} type="menu-item" item={menuItem} />
  ));

  return (
    <Container fluid h="100%" p="xl">
      <Title order={2} mb="lg">
        Main Menu
      </Title>
      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3, xl: 4 }} spacing="md">
        {items}
      </SimpleGrid>
    </Container>
  );
}
