import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class UserDevice {
  @PrimaryGeneratedColumn('uuid')
  userDeviceId: string;

  @Column({ nullable: true})
  userId: string;

  @Column({ nullable: true})
  deviceId: string;

  @Column({ nullable: true})
  createdAt: string;

  @Column({ nullable: true})
  updatedAt: string;
}