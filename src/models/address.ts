import {BaseEntity, Column, CreateDateColumn, Entity, OneToOne, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm"
import {Chargers} from "./charger";

@Entity("addresses")
class Addresses extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number

    @OneToOne(() => Chargers, (charger) => charger.address)
    charger: Chargers

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    line1: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    line2: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 64
    })
    location: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 64
    })
    city: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 64
    })
    state: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 16
    })
    zipCode: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: true,
        length: 64
    })
    country: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Addresses,
}