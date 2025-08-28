import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, OneToMany, Index } from 'typeorm';
import { LedgerEntry } from './LedgerEntry';
import { TxnCategory } from './enums';

@Entity('transactions')
export class Transaction {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ unique: true })
    externalRef!: string; // Razorpay payment_id OR session_id

    @Column({ type: 'enum', enum: TxnCategory })
    category!: TxnCategory;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => LedgerEntry, le => le.transaction)
    entries!: LedgerEntry[];
}
