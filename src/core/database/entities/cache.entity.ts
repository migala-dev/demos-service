import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity('cache')
export class Cache {
  @PrimaryGeneratedColumn('uuid')
  cacheId: string;

  @Column({ type: 'uuid' })
  userId: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  entityName: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  eventName: string;

  @Column({ type: 'text', nullable: true })
  data: string;

  @Column({ type: 'timestamptz', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;
}
