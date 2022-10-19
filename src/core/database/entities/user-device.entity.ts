import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';
import { DateColumns } from './utils/date-columns.helper';

@Entity('user_devices')
export class UserDevice extends DateColumns {
  @PrimaryGeneratedColumn('uuid')
  userDeviceId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceId: string;
}