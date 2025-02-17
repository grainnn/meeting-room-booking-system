import {
  Column,
  CreateDateColumn,
  Entity,
  JoinTable,
  ManyToMany,
  PrimaryGeneratedColumn,
  UpdateDateColumn
} from 'typeorm';
import { Exclude, Expose } from 'class-transformer';

import { Role } from './role.entity';

@Entity({
  name: 'user'
})
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({
    length: 50,
    comment: '用户名',
    unique: true
  })
  username: string;

  @Column({
    length: 50,
    comment: '昵称'
  })
  nickName: string;

  // 屏蔽vo
  @Exclude()
  @Column({
    length: 50,
    comment: '密码'
  })
  password: string;

  // 追加vo
  @Expose()
  get name(): string {
    return `${this.username} ${this.email}`;
  }

  @Column({
    comment: '邮箱',
    length: 50
  })
  email: string;

  @Column({
    comment: '头像',
    length: 100,
    nullable: true
  })
  avatar: string;

  @Column({
    comment: '手机号',
    length: 20,
    nullable: true
  })
  mobile: string;

  @Column({
    comment: '是否冻结',
    default: false
  })
  isFrozen: boolean;

  @Column({
    comment: '是否是管理员',
    default: false
  })
  isAdmin: boolean;

  @CreateDateColumn()
  createTime: Date;

  @UpdateDateColumn()
  updateTime: Date;

  @ManyToMany(() => Role)
  @JoinTable({
    name: 'user_roles'
  })
  roles: Role[];
}
