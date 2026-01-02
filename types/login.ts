import z from 'zod';
import { LoginInputSchema, LoginStateSchema, LoginStepEnum } from '@/schema/login';

export type TLoginInput = z.infer<typeof LoginInputSchema>;

export type TLoginState = z.infer<typeof LoginStateSchema>;

export type TLoginStep = z.infer<typeof LoginStepEnum>;
