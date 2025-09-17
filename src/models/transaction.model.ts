import {Entity, PrimaryColumn, Column, CreateDateColumn, OneToMany, Index, BeforeInsert} from 'typeorm';
import { LedgerEntry } from './LedgerEntry.model';
import { TxnCategory } from '../utils/enums';
import {v7} from "uuid";

@Entity('transactions')
export class Transaction {
    @PrimaryColumn('uuid')
    id!: string;

    @Index({ unique: true })
    @Column({ unique: true })
    externalRef!: string; // Razorpay payment_id OR session_id

    @Column({
        type: 'numeric',
        precision: 20,
        scale: 4,
    })
    amount!: string; //Always positive

    @Column({ type: 'enum', enum: TxnCategory })
    category!: TxnCategory;

    @Column({ type: 'text', nullable: true })
    description!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @OneToMany(() => LedgerEntry, le => le.transaction)
    entries!: LedgerEntry[];

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }
}
