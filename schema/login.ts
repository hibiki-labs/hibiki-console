import z from 'zod';
import { UserSchema } from './user';

export const LoginStepEnum = z.enum(['credential-input', 'OTP-input']);

export const LoginInputSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal(LoginStepEnum.enum['credential-input']),
    userId: UserSchema.shape.id,
    password: z.string().min(1, { message: 'Password is required.' }).trim(),
  }),
  z.object({
    step: z.literal(LoginStepEnum.enum['OTP-input']),
    userId: UserSchema.shape.id,
    OTP: z
      .string()
      .length(4, { message: 'OTP must be 4 digits.' })
      .regex(/^[0-9]+$/, { message: 'OTP must contain only numbers.' }),
  }),
]);

export const LoginStateSchema = z.discriminatedUnion('step', [
  z.object({
    step: z.literal(LoginStepEnum.enum['credential-input']),
    userId: UserSchema.shape.id,
    errors: z
      .object({
        userId: z.array(z.string()).optional(),
        password: z.array(z.string()).optional(), // Only here
        generic: z.array(z.string()).optional(),
      })
      .nullable(),
  }),
  z.object({
    step: z.literal(LoginStepEnum.enum['OTP-input']),
    userId: UserSchema.shape.id,
    errors: z
      .object({
        userId: z.array(z.string()).optional(),
        OTP: z.array(z.string()).optional(), // Only here
        generic: z.array(z.string()).optional(),
      })
      .nullable(),
  }),
]);
