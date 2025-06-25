import {Entity, PrimaryGeneratedColumn, Column, BaseEntity, UpdateDateColumn, CreateDateColumn} from "typeorm";

export enum UserRole {
    ADMIN = 'admin',
    SUPERVISOR = 'supervisor',
    CUSTOMER = 'customer',
}

@Entity("users")
export class Users extends BaseEntity {
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

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    vehicle!: string;

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
    isAccountApproved: boolean

    @Column({type: "boolean", default: false})
    isProfileComplete: boolean

    @Column({type: "boolean", default: true})
    isActive!: boolean;

    @Column({type: "boolean", default: false})
    isDeleted!: boolean;

    @Column({
        type: 'enum',
        enum: UserRole,
        default: UserRole.CUSTOMER,
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
