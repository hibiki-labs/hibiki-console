import { IconDeviceDesktopOff } from '@tabler/icons-react'; // or any icon you use
import { Box, Center, Container, Stack, Text, Title } from '@mantine/core';

interface ViewportGuardProps {
  children: React.ReactNode;
}

export function ViewportGuard({ children }: ViewportGuardProps) {
  // "sm" is the breakpoint.
  // - The APP is visible FROM 'sm' and up.
  // - The ERROR is hidden FROM 'sm' and up (meaning visible only below 'sm').
  const BREAKPOINT = 'md';

  return (
    <>
      {/* 1. The Main Application */}
      {/* visibleFrom="sm" adds a CSS rule: display: none when width < sm */}
      <Box visibleFrom={BREAKPOINT} h="100%">
        {children}
      </Box>

      {/* 2. The Error Screen */}
      {/* hiddenFrom="sm" adds a CSS rule: display: none when width >= sm */}
      <Center hiddenFrom={BREAKPOINT} h="100vh" bg="gray.0" p="md">
        <Container size="xs">
          <Stack align="center" gap="md">
            <IconDeviceDesktopOff size={64} stroke={1.5} color="gray" />

            <Title order={2} ta="center" c="dark">
              Desktop Only
            </Title>

            <Text c="dimmed" ta="center" size="lg">
              This application is optimized for larger screens. Please open it on a desktop or
              laptop device.
            </Text>
          </Stack>
        </Container>
      </Center>
    </>
  );
}
