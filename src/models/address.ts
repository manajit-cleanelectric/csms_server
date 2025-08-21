import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate
} from "typeorm"
import {Chargers} from "./charger";
import {toTitleCase} from "../services/titleCase.services";

@Entity("addresses")
class Addresses extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @OneToOne(() => Chargers, (charger) => charger.address)
    charger: Chargers;

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

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        this.line1 = toTitleCase(this.line1);
        this.line2 = toTitleCase(this.line2);
        this.location = toTitleCase(this.location);
        this.city = toTitleCase(this.city);
        this.state = toTitleCase(this.state);
        this.zipCode = toTitleCase(this.zipCode);
    }
}

export {
    Addresses,
}