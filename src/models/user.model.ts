import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany, OneToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {Vehicles} from "./vehicle.model";
import {AuthTokens} from "./authToken.model";
import {Sessions} from "./session.model";
import {Wallet} from "./wallet.model";
import {toTitleCase} from "../utils/titleCase";
import {v7} from "uuid";

enum UserRoles {
    ADMINISTRATOR = 'administrator',
    SUPERVISOR = 'supervisor',
    CUSTOMER = 'customer',
}

@Entity("users")
class Users extends BaseEntity {
    @PrimaryColumn("uuid")
    id!: string;

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

    @OneToOne(() => Wallet, (w) => w.user)
    wallet!: Wallet;

    @OneToMany(() => Sessions, (session) => session.user)
    sessions!: Sessions[];

    @OneToMany(() => AuthTokens, (authToken) => authToken.user)
    authTokens!: AuthTokens[];

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

    @Column({
        type: "varchar",
        nullable: true,
        length: 254,
    })
    email!: string;

    @Column({type: "boolean", default: false})
    isEmailVerified!: boolean;

    @Column({type: "boolean", default: false})
    isAccountApproved: boolean;

    @Column({type: "boolean", default: false})
    isProfileComplete: boolean;

    @Column({type: "boolean", default: false})
    isVehicleRegistered: boolean;

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

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    public get fullName() {
        return this.firstName + " " + this.lastName;
    }

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }

    @BeforeInsert()
    @BeforeUpdate()
    transformFields() {
        if (this.phoneNumber) this.phoneNumber = toTitleCase(this.phoneNumber);
        if (this.firstName) this.firstName = toTitleCase(this.firstName);
        if (this.city) this.city = toTitleCase(this.city);
        if (this.state) this.state = toTitleCase(this.state);
        if (this.email) this.email = this.email.toLowerCase();
    }
}

export {
    Users,
    UserRoles
}
