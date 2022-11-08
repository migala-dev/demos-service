import { BeforeInsert, Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { InvitationStatus, SpaceRole } from '../../enums';
import { ByAndDateColumns } from './utils/by-and-date-columns.helper';

@Entity('members')
export class Member extends ByAndDateColumns {
  @PrimaryGeneratedColumn('uuid')
  memberId: string;

  @Column({ type: 'uuid' })
  spaceId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'integer', enum: InvitationStatus, nullable: true })
  invitationStatus: InvitationStatus;

  @Column({ type: 'varchar', length: 30, enum: SpaceRole })
  role: SpaceRole;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name: string;

  @Column({ type: 'timestamptz', nullable: true })
  expiredAt: Date;

  @Column({ type: 'boolean', default: false, nullable: true })
  deleted: boolean;

  @BeforeInsert()
  public setExpireAt() {
    if (this.invitationStatus === InvitationStatus.SENDED) {
      const today: Date = new Date();
      const expiredDate: Date = new Date();
      expiredDate.setDate(today.getDate() + 7);
      this.expiredAt = expiredDate;
    }
  }
}
