import {Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, Check, BaseEntity} from "typeorm"

export enum ChargerTypes {
    TYPE_6 = 'type_6',
    CCS_2 = 'ccs2'
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
    location: string

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
        unique: true,
        nullable: false
    })
    @Check(`"noOfConnector" >= 1 AND "noOfConnector" <= 10`)
    noOfConnector: number;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

}