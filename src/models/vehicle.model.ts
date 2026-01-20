import {
    BaseEntity, BeforeInsert, BeforeRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity, Index,
    JoinColumn,
    ManyToOne, OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./user.model";
import {toTitleCase} from "../utils/titleCase";
import {v7} from "uuid";
import {Image} from "./image.model";


@Entity("vehicles")
class Vehicles extends BaseEntity {
    @PrimaryColumn("uuid")
    id!: string;

    @ManyToOne(() => Users, (user) => user.vehicles, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({name: "userId"})
    user!: Users | null;

    @Column({
        type: "varchar",
        nullable: true,
        length: 128
    })
    model!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 128
    })
    vendor!: string;

    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 64
    })
    vin!: string;

    @Column({
        type: "varchar",
        unique: true,
        nullable: true,
        length: 64
    })
    bin!: string;

    @Column({
        type: "varchar",
        nullable: true,
        unique: true,
        length: 16
    })
    vehicleNo!: string;

    // @Column({
    //     type: "varchar",
    //     nullable: true,
    //     length: 64
    // })
    // @Index('Vehicle RC Number', ['rcNumber'], {unique: true})
    // rcNumber!: string;

    @Column({type: "boolean", default: false})
    isApproved!: boolean;

    // @Column({
    //     type: "varchar",
    //     nullable: true,
    //     length: 256
    // })
    // rcImageUrl!: string;

    @OneToMany(() => Image, (image) => image.vehicle, {cascade: true})
    proofImages!: Image[];

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
        if (this.model) this.model = toTitleCase(this.model).trim();
        if (this.vendor) this.vendor = toTitleCase(this.vendor).trim();
        if (this.vin) this.vin = this.vin.toUpperCase().trim();
        if (this.vehicleNo) this.vehicleNo = this.vehicleNo.toUpperCase().trim();
        if (this.bin) this.bin = this.bin.toUpperCase().trim();
        // if (this.rcNumber) this.rcNumber = this.rcNumber.toUpperCase();
    }

    @BeforeRemove()
    performCleanup() {
        // delete rc image file
    }
}

export {
    Vehicles,
};