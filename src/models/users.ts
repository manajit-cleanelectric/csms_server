import {
    BaseEntity, BeforeInsert, BeforeUpdate,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany, OneToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Vehicles} from "./vehicle";
import {AuthTokens} from "./authTokens";
import {Sessions} from "./sessions";
import {Wallet} from "./wallets";
import {toTitleCase} from "../services/titleCase.services";

enum UserRoles {
    ADMINISTRATOR = 'administrator',
    SUPERVISOR = 'supervisor',
    CUSTOMER = 'customer',
}

@Entity("users")
class Users extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
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
    @BeforeUpdate()
    transformFields() {
        this.phoneNumber = toTitleCase(this.phoneNumber);
        this.firstName = toTitleCase(this.firstName);
        this.city = toTitleCase(this.city);
        this.state = toTitleCase(this.state);
    }
}

export {
    Users,
    UserRoles
}
