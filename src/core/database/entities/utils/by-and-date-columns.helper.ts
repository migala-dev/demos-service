import { Column } from 'typeorm';
import { DateColumns } from './date-columns.helper';

export class ByAndDateColumns extends DateColumns {
  @Column({ type: 'uuid' })
  createdBy: string;

  @Column({ type: 'uuid' })
  updatedBy: string;
}