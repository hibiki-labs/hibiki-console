'use client';

import React, { useMemo, useState } from 'react';
import { useRouter } from 'next/navigation';
import {
  IconBell,
  IconChevronDown,
  IconGripVertical,
  IconHome2,
  IconLogout,
  IconRobot,
  IconSearch,
  IconSettings,
  IconSnowflake,
  IconSunMoon,
  IconUser,
} from '@tabler/icons-react';
import {
  ActionIcon,
  AppShell,
  Avatar,
  Badge,
  Box,
  Flex,
  Group,
  Indicator,
  Kbd,
  Menu,
  ScrollArea, // Added ScrollArea import
  Stack,
  Text,
  ThemeIcon,
  Title,
  Tooltip,
  UnstyledButton,
  useMantineColorScheme,
} from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import { spotlight, Spotlight, SpotlightActionData } from '@mantine/spotlight';
import { logout } from '@/actions/auth';
import { theme } from '@/theme';
import { MenuItem } from '@/types/navigation';
import DynamicTablerIcon from '../DynamicIcon/DynamicIcon';
import classes from './AppShellLayout.module.css';

export function AppShellLayout({
  children,
  menu,
}: {
  children: React.ReactNode;
  menu: MenuItem[];
}) {
  const router = useRouter();
  const [opened, { toggle, open: expandNav }] = useDisclosure(true);
  const [activeMenuItemId, setActiveMenuItemId] = useState<string>('home');
  const [activeSubMenuItemId, setActiveSubMenuItemId] = useState<string>();
  const { toggleColorScheme } = useMantineColorScheme();

  const activeMenuItem = useMemo(
    () => menu.find((item) => item.id === activeMenuItemId),
    [menu, activeMenuItemId]
  );

  const subMenuItems = useMemo(() => {
    if (activeMenuItemId === 'home' || activeMenuItemId === 'ai' || !activeMenuItem) {
      return [];
    }

    return activeMenuItem.subMenu.map((subMenuItem) => (
      <a
        key={subMenuItem.id}
        className={classes['sub-menu-item']}
        data-active={activeSubMenuItemId === subMenuItem.id || undefined}
        href="#"
        onClick={(event) => {
          event.preventDefault();
          setActiveSubMenuItemId(subMenuItem.id);
          router.push(`/menu/${activeMenuItemId}/submenu/${subMenuItem.id}`);
        }}
      >
        {subMenuItem.title}
      </a>
    ));
  }, [activeMenuItemId, activeMenuItem, activeSubMenuItemId, router]);

  const screens = useMemo(
    () =>
      menu.flatMap((menuItem) => menuItem.subMenu.flatMap((subMenuItem) => subMenuItem.screens)),
    [menu]
  );

  const actions: SpotlightActionData[] = screens.map((screen) => ({
    id: screen.id.toString(),
    label: `${screen.id.toString()} ${screen.title}`,
    description: screen.title,
    onClick: () => {
      router.push(`/screen/${screen.id}`);
    },
    // leftSection: <Code>{screen.id}</Code>,
  }));

  const user = {
    name: 'Abhigyan Prakash',
    email: 'test@abc.com',
    role: 'test',
    avatar: '',
  };

  return (
    <AppShell
      h="100%"
      header={{ height: 60 }}
      footer={{ height: 16 }}
      navbar={{
        width: activeMenuItemId !== 'home' && opened ? 360 : 60,
        breakpoint: 'sm',
        // collapsed: { mobile: !opened, desktop: !opened },
      }}
      aside={{
        width: 16,
        breakpoint: 'md',
        collapsed: { desktop: false, mobile: true },
      }}
    >
      <AppShell.Header>
        <Group h="100%" px="md" justify="space-between">
          <Group gap="sm" pr="9rem">
            <div className={classes.logoWrapper}>
              <IconSnowflake size={32} className={classes.logo} />
            </div>
            <div>
              <Text size="lg" fw={700} className={classes.brandName}>
                B@ncs Crest
              </Text>
              <Text size="xs" c="dimmed" className={classes.brandTagline}>
                KCCB B@ncs 24
              </Text>
            </div>
          </Group>
          <Group style={{ flex: 1, maxWidth: 600 }} justify="center">
            <UnstyledButton onClick={spotlight.open} className={classes.search}>
              <Group gap="xs" wrap="nowrap">
                <IconSearch size={18} stroke={1.5} style={{ opacity: 0.6 }} />
                <Text ta="center" size="sm" c="dimmed" style={{ flex: 1 }}>
                  Spotlight
                </Text>
                <Group gap={4}>
                  <Kbd size="xs">⌘</Kbd>
                  <Kbd size="xs">K</Kbd>
                </Group>
              </Group>
            </UnstyledButton>
            <Spotlight
              actions={actions}
              nothingFound="Nothing found..."
              highlightQuery
              searchProps={{
                leftSection: <IconSearch size={20} stroke={1.5} />,
                placeholder: 'Search...',
              }}
            />
          </Group>

          <Group gap="xs" align="center">
            <ActionIcon
              variant="subtle"
              size="lg"
              radius="md"
              mb="0.3rem"
              onClick={() => toggleColorScheme()}
              className={classes['action-icon']}
            >
              <IconSunMoon size={20} stroke={1.5} />
            </ActionIcon>

            {/* Notifications */}
            <Menu shadow="md" width={300} position="bottom-end">
              <Menu.Target>
                <ActionIcon
                  variant="subtle"
                  size="lg"
                  radius="md"
                  className={classes['action-icon']}
                >
                  <Indicator inline processing color="red" size={8}>
                    <IconBell size={20} stroke={1.5} />
                  </Indicator>
                </ActionIcon>
              </Menu.Target>
              <Menu.Dropdown>
                <Menu.Label>Notifications</Menu.Label>
                <Menu.Item leftSection={<IconBell size={16} />}>
                  <div>
                    <Text size="sm" fw={500}>
                      New system update available
                    </Text>
                    <Text size="xs" c="dimmed">
                      2 minutes ago
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Item leftSection={<IconBell size={16} />}>
                  <div>
                    <Text size="sm" fw={500}>
                      Report generated successfully
                    </Text>
                    <Text size="xs" c="dimmed">
                      1 hour ago
                    </Text>
                  </div>
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item c="blue">View all notifications</Menu.Item>
              </Menu.Dropdown>
            </Menu>

            {/* User Menu */}
            <Menu shadow="md" width={260} position="bottom-end">
              <Menu.Target>
                <UnstyledButton className={classes.user}>
                  <Group gap="sm">
                    <Avatar
                      src={user?.avatar}
                      radius="xl"
                      size="md"
                      color={theme.primaryColor}
                      alt={user?.name || 'User'}
                    >
                      {user?.name?.charAt(0) || 'U'}
                    </Avatar>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <Text size="sm" fw={500} style={{ lineHeight: 1 }}>
                        {user?.name || 'Guest User'}
                      </Text>
                      <Text size="xs" c="dimmed" truncate style={{ lineHeight: 1.5 }}>
                        {user?.email || 'user@example.com'}
                      </Text>
                    </div>
                    <IconChevronDown size={16} stroke={1.5} style={{ opacity: 0.6 }} />
                  </Group>
                </UnstyledButton>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Label>
                  <Group gap="xs">
                    {user?.role && (
                      <Badge size="xs" variant="light">
                        {user.role}
                      </Badge>
                    )}
                  </Group>
                </Menu.Label>
                <Menu.Item leftSection={<IconUser size={16} />}>Profile</Menu.Item>
                <Menu.Item leftSection={<IconSettings size={16} />}>Account Settings</Menu.Item>
                <Menu.Divider />
                <form action={logout}>
                  <Menu.Item
                    color="red"
                    leftSection={<IconLogout size={16} />}
                    component="button"
                    type="submit"
                  >
                    Logout
                  </Menu.Item>
                </form>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>
      </AppShell.Header>
      {/* <AppShell.Header>
        <EnhancedHeader />
      </AppShell.Header> */}

      <AppShell.Navbar>
        <Flex h="100%">
          {/* Main Left Icon Bar */}
          <Stack flex="0 0 60px" align="center" py="md" h="100%" justify="space-between">
            <Stack gap="xs" style={{ flex: 1, width: '100%', overflow: 'hidden' }} align="center">
              {activeMenuItemId !== 'home' && (
                <Tooltip
                  label={opened ? 'Collapse Menu' : 'Expand Menu'}
                  position="right"
                  withArrow
                  transitionProps={{ duration: 0 }}
                  key="Toggle"
                >
                  <UnstyledButton onClick={toggle} className={classes['menu-action-icon']}>
                    <IconGripVertical size={22} stroke={1.5} />
                  </UnstyledButton>
                </Tooltip>
              )}

              {/* ScrollArea for the list of icons */}
              <ScrollArea h="100%" scrollbarSize={2} type="scroll" offsetScrollbars>
                <Stack gap="xs" align="center">
                  <Tooltip
                    label="Home"
                    position="right"
                    withArrow
                    transitionProps={{ duration: 0 }}
                    key="0"
                  >
                    <UnstyledButton
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveMenuItemId('home');
                        router.push('/');
                      }}
                      className={classes['action-icon']}
                      data-active={activeMenuItemId === 'home' || undefined}
                    >
                      <ThemeIcon variant="light" color={theme.primaryColor} size="lg" radius="md">
                        <IconHome2 size={22} stroke={1.5} />
                      </ThemeIcon>
                    </UnstyledButton>
                  </Tooltip>
                  {menu.map((menuItem) => (
                    <Tooltip
                      key={menuItem.id}
                      label={menuItem.title}
                      position="right"
                      withArrow
                      transitionProps={{ duration: 0 }}
                    >
                      <UnstyledButton
                        onClick={(event) => {
                          event.preventDefault();
                          setActiveMenuItemId(menuItem.id);
                          expandNav();
                          router.push(`/menu/${menuItem.id}`);
                        }}
                        className={classes['action-icon']}
                        data-active={menuItem.id === activeMenuItemId || undefined}
                      >
                        <ThemeIcon variant="light" color={menuItem.color} size="lg" radius="md">
                          <DynamicTablerIcon
                            icon={menuItem.icon}
                            style={{ width: '70%', height: '70%' }}
                            stroke={1.5}
                            size={22}
                          />
                        </ThemeIcon>
                      </UnstyledButton>
                    </Tooltip>
                  ))}
                  <Tooltip
                    key="ai"
                    label="AI"
                    position="right"
                    withArrow
                    transitionProps={{ duration: 0 }}
                  >
                    <UnstyledButton
                      onClick={(event) => {
                        event.preventDefault();
                        setActiveMenuItemId('ai');
                        expandNav();
                        router.push('/ai');
                      }}
                      className={classes['action-icon']}
                      data-active={activeMenuItemId === 'ai' || undefined}
                    >
                      <ThemeIcon variant="light" color="red" size="lg" radius="md">
                        <IconRobot size={22} stroke={1.5} />
                      </ThemeIcon>
                    </UnstyledButton>
                  </Tooltip>
                </Stack>
              </ScrollArea>
            </Stack>
          </Stack>

          {/* Submenu Area */}
          {opened && (
            // Replaced div with ScrollArea to allow submenu links to scroll
            <ScrollArea className={classes.main} type="scroll">
              <Title order={4} my="lg" ta="center" mr="xl">
                {activeMenuItemId === 'home'
                  ? 'Home'
                  : activeMenuItemId === 'ai'
                    ? 'AI'
                    : menu.find((menuItem) => menuItem.id === activeMenuItemId)?.title}
              </Title>
              {activeMenuItemId === 'home'
                ? 'Home'
                : activeMenuItemId === 'ai'
                  ? 'AI'
                  : subMenuItems}
            </ScrollArea>
          )}
        </Flex>
      </AppShell.Navbar>

      <AppShell.Main
        pos="relative"
        h="100%"
        style={{
          backgroundColor: 'light-dark(var(--mantine-color-gray-0), var(--mantine-color-dark-7))',
        }}
      >
        <Box h="100%" p="md">
          {children}
        </Box>
      </AppShell.Main>

      <AppShell.Aside />

      <AppShell.Footer bg={theme.primaryColor} />
    </AppShell>
  );
}
