import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { InvitationStatus, SpaceRole } from '../../enums';
import { ByAndDateColumns } from './utils/by-and-date-columns.helper';

@Entity('members')
export class Member extends ByAndDateColumns {
  @PrimaryGeneratedColumn('uuid')
  memberId: string;

  @Column({ nullable: true })
  spaceId: string;

  @Column({ nullable: true })
  userId: string;
  
  @Column({ enum: InvitationStatus })
  invitationStatus: number;

  @Column({ enum: SpaceRole, nullable: true })
  role: string;

  @Column({ nullable: true })
  name: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiredAt: Date;

  @Column({ default: false })
  deleted: boolean;

  public setExpireAt() {
    const today: Date = new Date();
    const expiredDate: Date = new Date();
    expiredDate.setDate(today.getDate() + 7);
    this.expiredAt = expiredDate;
  }
}