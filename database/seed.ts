import { hashPassword } from '@/lib/password';
import { RoleEnum } from '@/types/role';
import { PasswordStatus, TUser, UserStatus, UserType } from '@/types/user';
import User from './entities/User';
import AppDataSource from './source';

export async function seedDatabase() {
  const dataSourceManager = await AppDataSource.getManager();
  const userRepo = dataSourceManager.getRepository(User);

  const users: TUser[] = [
    {
      id: 'admin',
      name: 'Admin User',
      type: UserType.ADMIN,
      current_status: UserStatus.ACTIVE,
      password_status: PasswordStatus.USER_DEFINED,
      password_hash: await hashPassword('pwd123'),
      roles: [RoleEnum.SUPER_ADMIN],
    },
    {
      id: 'manager',
      name: 'Manager User',
      type: UserType.STANDARD,
      current_status: UserStatus.ACTIVE,
      password_status: PasswordStatus.USER_DEFINED,
      password_hash: await hashPassword('pwd123'),
      roles: [RoleEnum.MANAGER],
    },
    {
      id: 'user',
      name: 'Standard User',
      type: UserType.STANDARD,
      current_status: UserStatus.ACTIVE,
      password_status: PasswordStatus.USER_DEFINED,
      password_hash: await hashPassword('pwd123'),
      roles: [RoleEnum.USER],
    },
  ];

  await userRepo.save(users);

  // eslint-disable-next-line no-console
  console.log('Database seeded successfully');
}
