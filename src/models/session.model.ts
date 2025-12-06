import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger.model";
import {Connectors} from "./connector.model";
import {Users} from "./user.model";
import {Transaction} from "./transaction.model";

enum SessionStatus {
    IDLE = 'Idle',
    PREPARING = 'Preparing',
    CHARGING = 'Charging',
    SUSPENDED = 'Suspended',
    FINISHING = 'Finishing',
    FINISHED = 'Finished',
    UNAVAILABLE = 'Unavailable',
    FAULTED = 'Faulted',
}

enum Reason {
    DEAUTHORIZED = 'DeAuthorized',
    EMERGENCY_STOP = 'EmergencyStop',
    EV_DISCONNECTED = 'EVDisconnected',
    HARD_RESET = 'HardReset',
    LOCAL = 'Local',
    OTHER = 'Other',
    POWER_LOSS = 'PowerLoss',
    REBOOT = 'Reboot',
    REMOTE = 'Remote',
    SOFT_RESET = 'SoftReset',
    UNLOCK_COMMAND = 'UnlockCommand',
}

@Entity("sessions")
class Sessions extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @ManyToOne(() => Chargers, (charger) => charger.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({name: "chargerId"})
    charger!: Chargers;

    @ManyToOne(() => Connectors, (connector) => connector.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify",
        cascade: true,
    })
    @JoinColumn({name: "connectorId"})
    connector!: Connectors;

    @Column({
        type: "varchar",
        nullable: true,
        length: 16
    })
    vehicleNo!: string | null;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    vehicleVendor!: string | null;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    vehicleModel!: string | null;

    @ManyToOne(() => Users, (user) => user.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({name: "userId"})
    user!: Users | null;

    @Column({
        type: "timestamptz",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    startTime!: Date;

    @Column({
        type: "timestamptz",
        nullable: true
    })
    endTime!: Date;

    @Column({
        type: "bigint",
        nullable: true
    })
    meterStart!: number;

    @Column({
        type: "bigint",
        nullable: true
    })
    meterStop!: number;

    @Column({
        type: "int",
        nullable: true,
        default: 0
    })
    energyUsed!: number;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    location!: string;

    @Column({
        type: "int",
        unsigned: true,
        nullable: true
    })
    socStart!: number;

    @Column({
        type: "int",
        unsigned: true,
        nullable: true
    })
    socLast!: number;

    @Column({
        type: "enum",
        enum: Reason,
        nullable: true
    })
    reason!: Reason | null;

    @Column({
        type: "enum",
        enum: SessionStatus,
        default: SessionStatus.PREPARING,
    })
    status!: SessionStatus;

    @Column({
        type: "numeric",
        precision: 20,
        scale: 4,
        nullable: true,
        default: null,
    })
    baseAmount!: string | null; // Amount before tax and discounts

    @Column({
        type: "numeric",
        precision: 20,
        scale: 4,
        nullable: true,
        default: null,
    })
    netCGST!: string | null; // Tax amount

    @Column({
        type: "numeric",
        precision: 20,
        scale: 4,
        nullable: true,
    })
    netSGST!: string | null; // Tax amount

    @Column({
        type: "numeric",
        precision: 20,
        scale: 4,
        nullable: true,
    })
    netIGST!: string | null; // Tax amount

    @Column({
        type: "numeric",
        precision: 20,
        scale: 4,
        nullable: true,
        default: null,
    })
    totalAmount!: string | null; // Total amount to be paid by user (same as transaction.amount)

    @OneToOne(() => Transaction, {nullable: true})
    @JoinColumn({name: "transactionId"})
    transaction!: Transaction | null;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    Sessions,
    SessionStatus,
    Reason,
};