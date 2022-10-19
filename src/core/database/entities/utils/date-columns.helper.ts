import { BeforeUpdate, Column } from "typeorm";

export class DateColumns {
    @Column({ type: 'timestamptz', default: () => "CURRENT_TIMESTAMP" })
    createdAt: Date;
  
    @Column({ type: 'timestamptz', default: () => "CURRENT_TIMESTAMP" })
    updatedAt: Date;
    
    @BeforeUpdate()
    updateDates() {
        this.updatedAt = new Date();
    }
}