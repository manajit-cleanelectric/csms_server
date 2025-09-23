import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToOne,
    PrimaryColumn,
    UpdateDateColumn,
    BeforeInsert,
    BeforeUpdate
} from "typeorm"
import {Chargers} from "./charger.model";
import {toTitleCase} from "../utils/titleCase";
import {v7} from "uuid";

@Entity("addresses")
class Addresses extends BaseEntity {
    @PrimaryColumn("uuid")
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
    generateId() {
        this.id = v7();
    }

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        if (this.line1) this.line1 = toTitleCase(this.line1);
        if (this.line2) this.line2 = toTitleCase(this.line2);
        if (this.location) this.location = toTitleCase(this.location);
        if (this.city) this.city = toTitleCase(this.city);
        if (this.state) this.state = toTitleCase(this.state);
        if (this.zipCode) this.zipCode = toTitleCase(this.zipCode);
    }
}

export {
    Addresses,
}