import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Check,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn, ManyToOne,
    OneToMany,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm"
import {Sessions} from "./session.model";
import {Connectors} from "./connector.model";
import {Addresses} from "./address.model";
import {toTitleCase} from "../utils/titleCase";
import {Tariffs} from "./tariff.model";

export enum ChargerStatus {
    AVAILABLE = 'Available',
    FAULTED = 'Faulted',
    UNAVAILABLE = 'Unavailable',
}


@Entity("chargers")
export class Chargers extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    model: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    vendor: string;

    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 128
    })
    serialNumber: string;

    @Column({
        type: "varchar",
        unique: false,
        length: 64
    })
    city: string;

    @OneToOne(() => Addresses, (address) => address.charger, {cascade: true})
    @JoinColumn({name: "addressId"})
    address: Addresses;

    @Column({
        type: "int",
        nullable: false
    })
    @Check(`"noOfConnector" >= 1 AND "noOfConnector" <= 10`)
    noOfConnector: number;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 6,
        default: 0
    })
    latitude: number;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 6,
        default: 0
    })
    longitude: number;

    @Column({
        type: 'enum',
        enum: ChargerStatus,
        default: ChargerStatus.UNAVAILABLE,
    })
    status: ChargerStatus;

    @OneToMany(() => Sessions, (session) => session.charger)
    sessions: Sessions[];

    @OneToMany(() => Connectors, (connector) => connector.charger, {cascade: true})
    connectors: Connectors[];

    @ManyToOne(() => Tariffs, (tariff) => tariff.chargers, {cascade: true})
    @JoinColumn({name: "tariffId"})
    tariff: Tariffs;

    @Column({
        type: "timestamptz",
        nullable: true,
        default: () => "CURRENT_TIMESTAMP",
    })
    lastHeartBeat!: Date;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        this.model = toTitleCase(this.model);
        this.vendor = toTitleCase(this.vendor);
        this.serialNumber = this.serialNumber.toUpperCase();
        this.city = toTitleCase(this.city);
    }

    public get connectorTypes(): string[] {
        if (!this.connectors) return [];
        return this.connectors.map(connector => connector.type);
    }

}