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

@Entity("authTokens")
class AuthTokens extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: number;

    @ManyToOne(() => Users, (user) => user.authTokens)
    @JoinColumn({name: "userId"})
    user!: Users;

    @Column({
        type: "varchar",
        nullable: false,
        length: 1024
    })
    token!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    platform!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 64
    })
    location!: string;

    @Column({
        type: "varchar",
        unique: true,
        nullable: true,
        length: 32
    })
    ipAddress!: string;

    @Column({type: "boolean", default: false})
    isRevoked: boolean;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    AuthTokens,
}