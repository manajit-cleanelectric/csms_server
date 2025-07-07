import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check, BaseEntity} from "typeorm"

export enum ChargerTypes {
    TYPE_6 = 'type_6',
    CCS_2 = 'ccs_2'
}

export enum ChargerStatus {
    AVAILABLE = 'available',
    IN_USE = 'in_use',
    POWER_DOWN = 'power_down',
    DOWN_FOR_MAINTENANCE = 'down_for_maintenance',
    UNKNOWN = 'unknown',
}


@Entity("chargers")
export class Chargers extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    model: string

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    vendor: string

    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 128
    })
    serialNumber: string

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 10
    })
    city: string

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    address: string

    @Column({
        type: 'enum',
        enum: ChargerTypes,
        default: ChargerTypes.TYPE_6,
    })
    type: string

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
        default: ChargerStatus.UNKNOWN,
    })
    status: string

    // TODO: Different status for each connector

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}