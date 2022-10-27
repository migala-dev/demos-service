import { Column } from 'typeorm';
import { DateColumns } from './date-columns.helper';

export class ByAndDateColumns extends DateColumns {
  @Column({ nullable: true })
  createdBy: string;

  @Column({ nullable: true })
  updatedBy: string;
}