import {
    BaseEntity, BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {Users} from "./user.model";
import {v7} from "uuid";

@Entity("authTokens")
class AuthTokens extends BaseEntity {
    @PrimaryColumn("uuid")
    id!: string;

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
        unique: false,
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

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }
}

export {
    AuthTokens,
}