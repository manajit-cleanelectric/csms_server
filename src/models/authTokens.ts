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
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @ManyToOne(() => Users, (user) => user.authTokens)
    @JoinColumn({ name: "userId" })
    user!: Users;

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

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    AuthTokens,
}