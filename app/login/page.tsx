'use client';

import { useActionState } from 'react';
import LoginForm from '@/components/LoginForm/LoginForm';
import { TLoginState } from '@/types/login';
import { login } from '../../actions/auth';

const initialState: TLoginState = {
  step: 'credential-input',
  userId: '',
  errors: null,
};

export default function LoginPage() {
  const [loginState, loginAction, isPending] = useActionState(login, initialState);
  return <LoginForm loginState={loginState} loginAction={loginAction} loading={isPending} />;
}
