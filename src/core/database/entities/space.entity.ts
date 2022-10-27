import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

import { DateColumns } from './utils/date-columns.helper';

@Entity('spaces')
export class Space extends DateColumns {
  @PrimaryGeneratedColumn('uuid')
  spaceId: string;

  @Column({ type: 'varchar', length: 255 })
  name: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pictureKey: string;

  @Column({ type: 'integer' })
  approvalPercentage: number;

  @Column({ type: 'integer' })
  participationPercentage: number;

  @Column({ type: 'uuid' })
  ownerId: string;
}