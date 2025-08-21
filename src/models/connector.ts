import {
    BaseEntity, BeforeInsert, BeforeUpdate,
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
import {toTitleCase} from "../services/titleCase.services";

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
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Chargers, (charger) => charger.connectors)
    @JoinColumn({name: "chargerId"})
    charger!: Chargers;

    @Column({
        type: "int",
        unsigned: true,
        unique: false,
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

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        //Can be used to transform fields
    }

}

export {
    Connectors,
    ConnectorStatus
}