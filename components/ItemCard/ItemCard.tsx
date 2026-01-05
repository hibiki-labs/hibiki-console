import { IconChevronRight } from '@tabler/icons-react';
import { Box, Card, Group, rem, Text, ThemeIcon } from '@mantine/core';
import { MenuItem, ScreenItem, SubMenuItem } from '@/types/navigation';
import DynamicTablerIcon from '../DynamicIcon/DynamicIcon';
import classes from './ItemCard.module.css';

export default function ItemCard({
  item,
  type,
  menuId,
}:
  | {
      type: 'menu-item';
      item: Omit<MenuItem, 'subMenu'>;
      menuId?: undefined;
    }
  | {
      type: 'submenu-item';
      item: Omit<SubMenuItem, 'screens'>;
      menuId: string;
    }
  | {
      type: 'screen-item';
      item: ScreenItem;
      menuId?: undefined;
    }) {
  let href = '#';
  if (item.path) {
    href = item.path;
  } else if (type === 'menu-item') {
    href = `/menu/${item.id}`;
  } else if (type === 'submenu-item') {
    href = `/menu/${menuId}/submenu/${item.id}`;
  } else if (type === 'screen-item') {
    href = `/screen/${item.id.toString()}`;
  }

  return (
    <Card
      key={item.title}
      withBorder
      radius="lg"
      p="lg"
      component="a"
      href={href}
      className={classes.card}
    >
      {/* Gradient background effect on hover */}
      <Box
        className={classes.gradient}
        style={{
          background:
            type === 'menu-item'
              ? `linear-gradient(135deg, var(--mantine-color-${item.color}-0) 0%, transparent 60%)`
              : 'linear-gradient(135deg, var(--mantine-color-gray-0) 0%, transparent 60%)',
        }}
      />

      <Group justify="space-between" align="center" wrap="nowrap" className={classes.content}>
        <Group wrap="nowrap" gap="md">
          {type === 'menu-item' && (
            <ThemeIcon
              size={60}
              radius="md"
              variant="light"
              color={item.color}
              className={classes.icon}
            >
              <DynamicTablerIcon
                icon={item.icon}
                style={{ width: rem(32), height: rem(32) }}
                stroke={1.5}
              />
            </ThemeIcon>
          )}
          <Box>
            <Text fz="lg" fw={700} className={classes.title}>
              {item.title}
            </Text>
            <Text fz="sm" c="dimmed" mt={4} className={classes.subtitle}>
              {type === 'screen-item' ? `Screen ${item.id}` : 'Access module'}
            </Text>
          </Box>
        </Group>

        <Box className={classes.chevronBox}>
          <IconChevronRight
            style={{
              width: rem(20),
              height: rem(20),
            }}
            className={classes.chevron}
            stroke={2}
            color="var(--mantine-color-gray-6)"
          />
        </Box>
      </Group>
    </Card>
  );
}
