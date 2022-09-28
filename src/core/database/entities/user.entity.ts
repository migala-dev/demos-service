import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  userId: string;

  @Column()
  name: string;

  @Column()
  phoneNumber: string;

  @Column()
  profilePictureKey: string;

  @Column()
  cognitoId: string;

  @Column()
  createdAt: string;

  @Column()
  updatedAt: string;
}