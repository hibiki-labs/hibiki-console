import type { TUser } from '@/types/user';
import {
  Entity,
  PrimaryColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ROLE_KEYS } from '@/navigation/roles';

@Entity({ name: 'user' })
export default class User implements TUser {
  @PrimaryColumn({ type: 'varchar', nullable: false, unique: true })
  id: TUser['id'];

  @Column({ type: 'varchar', length: 100, nullable: false })
  name: TUser['name'];

  @Column({ type: 'varchar', nullable: false })
  type: TUser['type'];

  @Column({
    type: 'simple-array',
    default: [ROLE_KEYS.USER],
  })
  roles: TUser['roles'];

  @ManyToOne('User', { nullable: true })
  @JoinColumn({ name: 'supervisor_id' })
  supervisor?: User;

  @Column({ type: 'varchar', nullable: false })
  current_status: TUser['current_status'];

  @Column({ type: 'varchar', nullable: false })
  password_status: TUser['password_status'];

  @Column({ type: 'varchar', nullable: false })
  password_hash: TUser['password_hash'];

  @CreateDateColumn({ type: 'timestamp', default: () => 'CURRENT_TIMESTAMP' })
  created_at: TUser['created_at'];

  @UpdateDateColumn({ type: 'timestamp', nullable: true, onUpdate: 'CURRENT_TIMESTAMP' })
  updated_at: TUser['updated_at'];

  @DeleteDateColumn({ type: 'timestamp', select: false, nullable: true })
  deleted_at: TUser['deleted_at'];
}
