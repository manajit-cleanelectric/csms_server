import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    CreateDateColumn,
    OneToMany,
    Index,
    UpdateDateColumn, OneToOne, JoinColumn, BaseEntity
} from 'typeorm';
import {Users} from './user.model';
import {WalletType} from '../utils/enums';
import {LedgerEntry} from './LedgerEntry.model';

@Entity('wallets')
export class Wallet extends BaseEntity {
    @PrimaryGeneratedColumn('uuid')
    id!: string;

    @OneToOne(() => Users, (u) => u.wallet, {nullable: true})
    @JoinColumn()
    user!: Users | null;  // null for system wallets

    @Column({type: 'enum', enum: WalletType})
    type!: WalletType;

    @Column({default: 'INR'})
    currency!: string;

    @Index({unique: true})
    @Column({unique: true})
    code!: string; // e.g. USER:<userId> or SYSTEM:RAZORPAY_SETTLEMENT

    @Column({type: 'numeric', precision: 20, scale: 4, default: 0})
    balance!: string; // store as DECIMAL string

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @OneToMany(() => LedgerEntry, le => le.wallet)
    entries!: LedgerEntry[];
}
