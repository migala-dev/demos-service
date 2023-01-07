import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './utils/date-columns.helper';

@Entity('users')
export class User extends DateColumns {
  @PrimaryGeneratedColumn('uuid')
  userId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  phoneNumber: string;

  @Column({ nullable: true })
  profilePictureKey: string;

  @Column({ nullable: true })
  cognitoId: string;
}
