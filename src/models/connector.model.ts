import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger.model";
import {Sessions} from "./session.model";

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

enum ConnectorType {
    // Passenger cars
    TYPE_2_AC = 'TYPE_2_AC',
    CCS2_DC = 'CCS2_DC',
    CHADEMO_DC = 'CHADEMO_DC',
    TYPE_1_AC = 'TYPE_1_AC',

    // Light EVs (2W/3W)
    TYPE_6_DC = 'TYPE_6_DC',
    TYPE_7_ACDC = 'TYPE_7_ACDC',

    // Bharat (legacy/transition)
    BHARAT_AC001 = 'BHARAT_AC001',
    BHARAT_DC001 = 'BHARAT_DC001',

    // Bus/heavy-vehicle depot and public DC
    GBT_AC = 'GBT_AC',
    GBT_DC = 'GBT_DC',

    // Automated high-power interfaces (buses)
    PANTOGRAPH_DOWN = 'PANTOGRAPH_DOWN',
    PANTOGRAPH_UP = 'PANTOGRAPH_UP'
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
        type: 'enum',
        enum: ConnectorType,
        default: ConnectorType.TYPE_6_DC,
    })
    type: string;

    @Column({
        type: "enum",
        enum: ConnectorStatus,
        default: ConnectorStatus.AVAILABLE
    })
    status!: ConnectorStatus;

    @OneToMany(() => Sessions, (session) => session.connector)
    sessions!: Sessions[];

    @OneToOne(() => Sessions, {cascade: true})
    @JoinColumn({name: "currentSessionId"})
    currentSession!: Sessions | null;

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
    ConnectorType,
    ConnectorStatus
}