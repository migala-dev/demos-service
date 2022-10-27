import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateColumns } from './utils/date-columns.helper';
import { SpaceRole } from '../../enums';
import { InvitationStatus } from '../../enums/invitation-status.enum';

@Entity('members')
export class Member extends DateColumns {
  @PrimaryGeneratedColumn('uuid')
  memberId: string;

  @Column()
  spaceId: string;

  @Column()
  userId: string;
  
  @Column({ enum: InvitationStatus })
  invitationStatus: number;

  @Column({ enum: SpaceRole})
  role: string;

  @Column({ nullable: true })
  name: string;

  @Column()
  expiredAt: Date;

  @Column()
  deleted: boolean;

  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;

  public setExpireAt() {
    const today: Date = new Date();
    const expiredDate: Date = new Date();
    expiredDate.setDate(today.getDate() + 7);
    this.expiredAt = expiredDate;
  }
}