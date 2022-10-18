import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('user_devices')
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  userDeviceId: string;

  @Column('uuid')
  userId: string;

  @Column({ type: 'varchar', length: 255 })
  deviceId: string;

  @Column({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date;
}