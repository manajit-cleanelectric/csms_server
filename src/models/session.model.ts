import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger.model";
import {Connectors} from "./connector.model";
import {Users} from "./user.model";

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
        orphanedRowAction: "nullify"
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
        type: "float",
        nullable: true
    })
    meterStart!: number;

    @Column({
        type: "float",
        nullable: true
    })
    meterStop!: number;

    @Column({
        type: "float",
        nullable: true
    })
    energyUsed!: number;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    location!: string;

    @Column({
        type: "float",
        nullable: true
    })
    socStart!: number;

    @Column({
        type: "float",
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

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    Sessions,
    SessionStatus
};