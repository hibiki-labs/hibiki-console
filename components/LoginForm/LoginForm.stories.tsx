import { Meta, StoryObj } from '@storybook/nextjs';
import LoginForm from './LoginForm';

const meta = {
  component: LoginForm,
  title: 'LoginForm',
} satisfies Meta<typeof LoginForm>;

export default meta;

type Story = StoryObj<typeof meta>;

export const CredentialInput: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'credential-input',
      errors: null,
    },
  },
};

export const LoggingIn: Story = {
  args: {
    loading: true,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'credential-input',
      errors: null,
    },
  },
};

export const LoginFailedWithUserIdError: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'credential-input',
      errors: { userId: ['Something wrong with the user ID'] },
    },
  },
};

export const LoginFailedWithPasswordError: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'credential-input',
      errors: { password: ['Something wrong with the password'] },
    },
  },
};

export const LoginFailedWithGenericError: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'credential-input',
      errors: { generic: ['Wrong user ID or password'] },
    },
  },
};

export const OTPInput: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'OTP-input',
      errors: null,
    },
  },
};

export const OTPBeingChecked: Story = {
  args: {
    loading: true,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'OTP-input',
      errors: null,
    },
  },
};

export const OTPCheckFailed: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'OTP-input',
      errors: { OTP: ['OTP did not match'] },
    },
  },
};

export const OTPCheckSuccessful: Story = {
  args: {
    loading: false,
    loginAction: () => {},
    loginState: {
      userId: '1234',
      step: 'OTP-input',
      errors: null,
    },
  },
};
