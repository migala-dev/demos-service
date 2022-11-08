import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  userDeviceId: string;

  @Column()
  userId: string;

  @Column()
  deviceId: string;

  @Column({ type: 'timestamptz', nullable: true })
  createdAt: Date;

  @Column({ type: 'timestamptz', nullable: true })
  updatedAt: Date;
}