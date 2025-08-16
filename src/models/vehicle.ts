import {
    BaseEntity, BeforeInsert, BeforeRemove, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./users";
import {toTitleCase} from "../services/titleCase.services";


@Entity("vehicles")
class Vehicles extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
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
        nullable: true,
        length: 16
    })
    vehicleNo!: string;

    @Column({
        type: "varchar",
        unique: true,
        nullable: true,
        length: 64
    })
    rcNumber!: string;

    @Column({type: "boolean", default: false})
    isApproved!: boolean;

    @Column({
        type: "varchar",
        nullable: true,
        length: 256
    })
    rcImageUrl!: string;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        this.model = toTitleCase(this.model);
        this.vendor = toTitleCase(this.vendor);
        this.vin = this.vin.toUpperCase();
        this.vehicleNo = this.vehicleNo.toUpperCase();
        this.rcNumber = this.rcNumber.toUpperCase();
    }

    @BeforeRemove()
    performCleanup() {
        // delete rc image file
    }
}

export {
    Vehicles,
};