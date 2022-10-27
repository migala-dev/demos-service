import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateColumns } from './utils/date-columns.helper';

@Entity('spaces')
export class Space extends DateColumns {
  @PrimaryGeneratedColumn('uuid')
  spaceId: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  description: string;

  @Column({ nullable: true })
  pictureKey: string;

  @Column()
  approvalPercentage: number;

  @Column()
  participationPercentage: number;

  @Column({ nullable: true })
  ownerId: string;
}