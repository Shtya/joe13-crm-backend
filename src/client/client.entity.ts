import { Entity, PrimaryGeneratedColumn, Column } from 'typeorm';

@Entity('clients')
export class Client {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  clientName: string;

  @Column({ nullable: true })
  commercialName?: string;

  @Column({ nullable: true })
  salesperson?: string;

  @Column({ nullable: true })
  country?: string;

  @Column({ nullable: true })
  city?: string;

  @Column({ type: 'date', nullable: true })
  joinedDate?: Date;

  @Column({ type: 'date', nullable: true })
  leavingDate?: Date;

  @Column({ nullable: true })
  reasonIfLeft?: string;

  @Column({ nullable: true })
  unit?: string;

  @Column({ nullable: true })
  remarks?: string;

  // ✅ Store structured contact info as JSONB
  @Column({ type: 'jsonb', nullable: true })
  clientdata?: {
    phone: string;
    email: string;
    designation: string;
    contactPerson: string;
  }[]|null;
}
