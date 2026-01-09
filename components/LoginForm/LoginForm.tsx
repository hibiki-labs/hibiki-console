import { IconLock, IconShieldCheck, IconSnowflake, IconUser } from '@tabler/icons-react';
import {
  Anchor,
  Box,
  Button,
  Container,
  Group,
  Paper,
  PasswordInput,
  PinInput,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { TLoginState } from '@/types/login';
import classes from './LoginForm.module.css';

type LoginFormProps = {
  loginState: TLoginState;
  loginAction: (formData: FormData) => void;
  loading?: boolean;
};

export default function LoginForm({ loginState, loginAction, loading = false }: LoginFormProps) {
  return (
    <div className={classes.wrapper}>
      {/* Left Side - Brand Section */}
      <div className={classes.brandSection}>
        <Box className={classes.brandOverlay} />
        <Box className={classes.animatedCircles}>
          <div className={classes.circle1} />
          <div className={classes.circle2} />
        </Box>

        <Container className={classes.brandContent}>
          <Group gap="md" mb="xl">
            <Box className={classes.logoBox}>
              <IconSnowflake size={32} stroke={2} />
            </Box>
            <Title order={2} c="white">
              B@ncs Crest
            </Title>
          </Group>

          <Title order={1} c="white" mb="xl" className={classes.welcomeTitle}>
            Welcome to
            <br />
            TCS Banking Platform
          </Title>

          <Text size="lg" c="white" opacity={0.9} mb="xl" maw={450}>
            Secure, reliable, and efficient banking solutions designed for modern financial
            institutions.
          </Text>

          <Stack gap="md">
            <Group gap="md">
              <Box className={classes.featureIcon}>
                <Text size="xl">✓</Text>
              </Box>
              <Text c="white" opacity={0.9}>
                Bank-grade security encryption
              </Text>
            </Group>
            <Group gap="md">
              <Box className={classes.featureIcon}>
                <Text size="xl">✓</Text>
              </Box>
              <Text c="white" opacity={0.9}>
                Two-factor authentication
              </Text>
            </Group>
            <Group gap="md">
              <Box className={classes.featureIcon}>
                <Text size="xl">✓</Text>
              </Box>
              <Text c="white" opacity={0.9}>
                24/7 transaction monitoring
              </Text>
            </Group>
          </Stack>
        </Container>
      </div>

      {/* Right Side - Form */}
      <div className={classes.formSection}>
        <Container size="xs" py="xl">
          {/* Mobile Logo */}
          <Group gap="md" mb="xl" className={classes.mobileOnly}>
            <Box className={classes.mobileLogoBox}>
              <IconShieldCheck size={24} stroke={2} />
            </Box>
            <Title order={3}>B@ncs Crest</Title>
          </Group>

          <form action={loginAction}>
            <input type="hidden" name="step" value={loginState.step} />

            {loginState.step === 'credential-input' ? (
              <>
                <Box mb="xl">
                  <Title order={2} mb="xs">
                    Sign In
                  </Title>
                  <Text c="dimmed">Enter your credentials to access your account</Text>
                </Box>

                <Stack gap="lg">
                  <TextInput
                    name="userId"
                    label="User ID / Teller ID"
                    placeholder="e.g. 1234"
                    size="md"
                    leftSection={<IconUser size={20} />}
                    readOnly={loading}
                    disabled={loading}
                    defaultValue={loginState.userId}
                    error={loginState.errors?.userId}
                    styles={{
                      input: {
                        borderRadius: '8px',
                      },
                    }}
                  />

                  <PasswordInput
                    name="password"
                    label="Password"
                    placeholder="Enter your password"
                    size="md"
                    leftSection={<IconLock size={20} />}
                    readOnly={loading}
                    disabled={loading}
                    error={loginState.errors?.password}
                    styles={{
                      input: {
                        borderRadius: '8px',
                      },
                    }}
                  />

                  {loginState.errors?.generic && (
                    <Paper
                      p="md"
                      bg="red.0"
                      style={{ border: '1px solid var(--mantine-color-red-3)' }}
                    >
                      <Text ta="center" c="red" size="sm">
                        {loginState.errors.generic}
                      </Text>
                    </Paper>
                  )}

                  <Button
                    type="submit"
                    size="md"
                    loading={loading}
                    fullWidth
                    styles={{
                      root: {
                        borderRadius: '8px',
                        height: '48px',
                      },
                    }}
                  >
                    Sign In
                  </Button>

                  <Group justify="space-between" pt="xs">
                    <Anchor size="sm" c="cyan">
                      Forgot Password?
                    </Anchor>
                    <Anchor size="sm" c="dimmed">
                      Need Help?
                    </Anchor>
                  </Group>
                </Stack>
              </>
            ) : (
              <>
                <Stack align="center" mb="xl">
                  <Box className={classes.otpIconBox}>
                    <IconShieldCheck size={32} stroke={2} />
                  </Box>
                  <Title order={2} ta="center">
                    Verify OTP
                  </Title>
                  <Text c="dimmed" ta="center">
                    Enter the 6-digit code sent to your registered device
                  </Text>
                </Stack>

                <Stack gap="xl" align="center">
                  <input name="userId" defaultValue={loginState.userId} hidden />
                  <PinInput
                    name="OTP"
                    size="lg"
                    length={4}
                    type="number"
                    error={!!loginState.errors?.OTP}
                    styles={{
                      input: {
                        borderRadius: '8px',
                      },
                    }}
                  />
                  {loginState.errors?.OTP && (
                    <Paper
                      p="md"
                      bg="red.0"
                      w="100%"
                      style={{ border: '1px solid var(--mantine-color-red-3)' }}
                    >
                      <Text ta="center" c="red" size="sm">
                        {loginState.errors.OTP}
                      </Text>
                    </Paper>
                  )}

                  <Button
                    type="submit"
                    size="md"
                    loading={loading}
                    fullWidth
                    styles={{
                      root: {
                        borderRadius: '8px',
                        height: '48px',
                      },
                    }}
                  >
                    Verify & Continue
                  </Button>

                  <Anchor size="sm" c="dimmed">
                    Didn't receive code?{' '}
                    <Text span c="cyan" fw={500}>
                      Resend
                    </Text>
                  </Anchor>
                </Stack>
              </>
            )}
          </form>

          <Box mt="xl" pt="xl" style={{ borderTop: '1px solid var(--mantine-color-gray-3)' }}>
            <Text ta="center" size="xs" c="dimmed">
              © 2025 TCS. All rights reserved.
            </Text>
            <Text ta="center" size="xs" c="dimmed" mt={4}>
              Protected by advanced security measures
            </Text>
          </Box>
        </Container>
      </div>
    </div>
  );
}
