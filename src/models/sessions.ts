import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    Timestamp,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger";
import {Connectors} from "./connector";
import {Vehicles} from "./vehicle";

enum SessionStatus {
    PREPARING = 'Preparing',
    CHARGING = 'Charging',
    SUSPENDED_EVSE = 'Suspended_EVSE',
    SUSPENDED_EV = 'Suspended_EV',
    FINISHING = 'Finishing',
    FAULTED = 'Faulted',
}

@Entity("sessions")
class Sessions extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @ManyToOne(() => Chargers, (charger) => charger.sessions)
    @JoinColumn({ name: "chargerId" })
    charger!: Chargers;

    @ManyToOne(() => Connectors, (connector) => connector.sessions)
    @JoinColumn({ name: "connectorId" })
    connector!: Connectors;

    @ManyToOne(() => Vehicles, (vehicle) => vehicle.sessions)
    @JoinColumn({ name: "vehicleId" })
    vehicle!: Vehicles;

    @Column({
        type: "timestamp",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    startTime!: Timestamp;

    @Column({
        type: "timestamp",
        nullable: true
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
        type: "enum",
        enum: SessionStatus,
        default: SessionStatus.PREPARING,
    })
    status!: SessionStatus;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Sessions,
    SessionStatus
};