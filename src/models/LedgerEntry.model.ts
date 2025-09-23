import {Entity, PrimaryColumn, Column, ManyToOne, CreateDateColumn, Index, BeforeInsert} from 'typeorm';
import { EntryType } from '../utils/enums';
import { Wallet } from './wallet.model';
import { Transaction } from './transaction.model';
import {v7} from "uuid";

@Entity('ledger_entries')
export class LedgerEntry {
    @PrimaryColumn('uuid')
    id!: string;

    @ManyToOne(() => Transaction, t => t.entries, { nullable: false })
    transaction!: Transaction;

    @ManyToOne(() => Wallet, w => w.entries, { nullable: false })
    wallet!: Wallet;

    @Index()
    @Column({ type: 'enum', enum: EntryType })
    type!: EntryType;

    @Column({ type: 'numeric', precision: 20, scale: 4 })
    amount!: string; // positive amounts only

    @Column({ type: 'text', nullable: true })
    memo!: string | null;

    @CreateDateColumn()
    createdAt!: Date;

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }
}
