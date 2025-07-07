import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Vehicles} from "./vehicle";

enum UserRoles {
    ADMINISTRATOR = 'administrator',
    SUPERVISOR = 'supervisor',
    CUSTOMER = 'customer',
}

@Entity("users")
class Users extends BaseEntity {
    @PrimaryGeneratedColumn()
    id!: number;

    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 10
    })
    phoneNumber!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    firstName!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    lastName!: string;

    @OneToMany(() => Vehicles, (vehicle) => vehicle.user)
    vehicles!: Vehicles[];

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    city!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    state!: string;

    @Column({type: "boolean", default: false})
    isAccountApproved: boolean;

    @Column({type: "boolean", default: false})
    isProfileComplete: boolean;

    @Column({type: "boolean", default: true})
    isActive!: boolean;

    @Column({type: "boolean", default: false})
    isDeleted!: boolean;

    @Column({
        type: 'enum',
        enum: UserRoles,
        default: UserRoles.CUSTOMER,
    })
    role!: string;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;

    public get fullName() {
        return this.firstName + " " + this.lastName;
    }
}

export {
    Users,
    UserRoles
}
