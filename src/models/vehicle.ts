import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./users";


@Entity("vehicles")
class Vehicles extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => Users, (user) => user.vehicles, {
        onDelete: "SET NULL",
        nullable: true,
        orphanedRowAction: "nullify"
    })
    @JoinColumn({ name: "userId" })
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

    @Column({ type: "boolean", default: false })
    isApproved!: boolean;

    @Column({
        type: "varchar",
        nullable: true,
        length: 256
    })
    rcImageUrl!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Vehicles,
};