import { Column } from 'typeorm';

export class ByColumns {
  @Column()
  createdBy: string;

  @Column()
  updatedBy: string;
}