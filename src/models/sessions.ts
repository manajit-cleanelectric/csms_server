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
import {Chargers} from "./charger";
import {Connectors} from "./connector";
import {Vehicles} from "./vehicle";
import {Users} from "./users";

enum SessionStatus {
    PREPARING = 'Preparing',
    CHARGING = 'Charging',
    FINISHING = 'Finishing',
    FINISHED = 'Finished',
    FAULTED = 'Faulted',
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
    @JoinColumn({ name: "chargerId" })
    charger!: Chargers;

    @ManyToOne(() => Connectors, (connector) => connector.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({ name: "connectorId" })
    connector!: Connectors;

    @ManyToOne(() => Vehicles, (vehicle) => vehicle.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({ name: "vehicleId" })
    vehicle!: Vehicles;

    @ManyToOne(() => Users, (user) => user.sessions, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({ name: "userId" })
    user!: Users | null;

    @Column({
        type: "timestamp",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    startTime!: Date;

    @Column({
        type: "timestamp",
        nullable: true
    })
    endTime!: Date;

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
        type: "int",
        unsigned: true,
        default: 0
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