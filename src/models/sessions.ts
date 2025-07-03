import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    UpdateDateColumn,
    CreateDateColumn,
    Timestamp, Check,
    ManyToOne, OneToMany, OneToOne
} from "typeorm";

enum Status {
    AVAILABLE = 'Available',
    PREPARING = 'Preparing',
    CHARGING = 'Charging',
    SUSPENDED_EVSE = 'Suspended_EVSE',
    SUSPENDED_EV = 'Suspended_EV',
    FINISHING = 'Finishing',
    RESERVED = 'Reserved',
    UNAVAILABLE = 'Unavailable',
    FAULTED = 'Faulted',
}

@Entity("sessions")
class Sessions extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @Column({
        type: "int",
        nullable: false
    })
    userId!: number;

    @Column({
        type: "int",
        nullable: false,
    })
    ChargerId!: number;

    @Column({
        type: "int",
        nullable: false,
        default: 0
    })
    connectorId!: number;

    @Column({
        type: "varchar",
        nullable: false,
        length: 64
    })
    VEN!: string;

    @Column({
        type: "datetime",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    startTime!: Timestamp;

    @Column({
        type: "datetime",
    })
    endTime!: Timestamp;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    meterStart!: number;

    @Column({
        type: "float",
    })
    meterStop!: number;

    @Column({
        type: "float",
    })
    energyUsed!: number;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    location!: string;

    @Column({
        type: "enum",
        enum: Status,
    })
    status!: Status;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Sessions,
    Status
};