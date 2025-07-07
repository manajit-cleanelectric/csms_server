import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger";
import {Sessions} from "./sessions";

enum ConnectorStatus {
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

@Entity("connectors")
class Connectors extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @ManyToOne(() => Chargers, (charger) => charger.connectors)
    @JoinColumn({ name: "chargerId" })
    charger!: Chargers;

    @Column({
        type: "int",
        unsigned: true,
    })
    chargerConnectorId!: number;

    @Column({
        type: "enum",
        enum: ConnectorStatus,
        default: ConnectorStatus.AVAILABLE
    })
    status!: ConnectorStatus;

    @OneToMany(() => Sessions, (session) => session.connector)
    sessions!: Sessions[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}

export {
    Connectors,
    ConnectorStatus
}