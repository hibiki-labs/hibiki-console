'use server';

import { cookies } from 'next/headers';
import { redirect } from 'next/navigation';
import { getIronSession } from 'iron-session';
import User from '@/database/entities/User';
import AppDataSource from '@/database/source';
import { isOTPEnabled } from '@/lib/config';
import { verifyPassword } from '@/lib/password';
import { LoginInputSchema } from '@/schema/login';
import getSessionOptions from '@/session/options';
import { TLoginState, TLoginStep } from '@/types/login';
import TSessionPayload from '@/types/session-payload';
import { TUser } from '@/types/user';

export async function logout() {
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());
  if (session.user) {
    // Always destroy frontend session
    session.destroy();
  }
  redirect('/login');
}

export async function login(loginState: TLoginState, formData: FormData): Promise<TLoginState> {
  const session = await getIronSession<TSessionPayload>(await cookies(), getSessionOptions());

  const step = formData.get('step') as TLoginStep;
  const userId = formData.get('userId') as TUser['id'] | undefined;
  const password = formData.get('password');
  const OTP = formData.get('OTP');

  const loginInputParsingResult = LoginInputSchema.safeParse({
    step,
    userId,
    password,
    OTP,
  });

  if (!loginInputParsingResult.success) {
    const issues = loginInputParsingResult.error.issues;
    const newLoginState: TLoginState = {
      userId: userId ?? '',
      step,
      errors: {
        userId: issues.filter((issue) => issue.path[0] === 'userId').map((issue) => issue.message),
        generic: issues
          .filter((issue) => issue.path[0] !== 'userId' && issue.path[0] !== 'password')
          .map((issue) => issue.message),
      },
    };
    if (newLoginState.errors?.userId?.length === 0) {
      newLoginState.errors.userId = undefined;
    }
    if (newLoginState.errors?.generic?.length === 0) {
      newLoginState.errors.generic = undefined;
    }
    if (newLoginState.step === 'credential-input') {
      newLoginState.errors = {
        ...newLoginState.errors,
        password: issues
          .filter((issue) => issue.path[0] === 'password')
          .map((issue) => issue.message),
      };
      if (newLoginState.errors?.password?.length === 0) {
        newLoginState.errors.password = undefined;
      }
    } else if (step === 'OTP-input') {
      newLoginState.errors = {
        ...newLoginState.errors,
        OTP: issues.filter((issue) => issue.path[0] === 'OTP').map((issue) => issue.message),
      };
      if (newLoginState.errors?.OTP?.length === 0) {
        newLoginState.errors.OTP = undefined;
      }
    }

    return newLoginState;
  }

  switch (loginState.step) {
    case 'credential-input': {
      const parsedData = loginInputParsingResult.data;
      if (parsedData.step !== 'credential-input') {
        return loginState;
      }
      const { userId: inputUserId, password: inputPassword } = parsedData;

      const manager = await AppDataSource.getManager();
      const userRepo = manager.getRepository(User);
      const user = await userRepo.findOne({ where: { id: inputUserId } });

      if (!user) {
        return {
          step: 'credential-input',
          userId: inputUserId,
          errors: { generic: ['Invalid user ID or password'] },
        };
      }

      const isPasswordValid = await verifyPassword(inputPassword, user.password_hash);
      if (!isPasswordValid) {
        return {
          step: 'credential-input',
          userId: inputUserId,
          errors: { generic: ['Invalid user ID or password'] },
        };
      }

      // If OTP is disabled, create session and redirect immediately
      if (!isOTPEnabled()) {
        session.user = {
          id: inputUserId,
          roles: ['super-admin'], // TODO: fetch from database
        };
        await session.save();
        return redirect('/');
      }

      return {
        step: 'OTP-input',
        userId: inputUserId,
        errors: null,
      };
    }

    case 'OTP-input':
      session.user = {
        id: loginInputParsingResult.data.userId,
        roles: ['super-admin'], // TODO: fetch from database
      };
      await session.save();
      return redirect('/');
  }
}
