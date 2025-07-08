import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./users";
import {Sessions} from "./sessions";


@Entity("vehicles")
class Vehicles extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @ManyToOne(() => Users, (user) => user.vehicles)
    @JoinColumn({ name: "userId" })
    user!: Users;

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

    @OneToMany(() => Sessions, (session) => session.vehicle)
    sessions!: Sessions[];

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Vehicles,
};