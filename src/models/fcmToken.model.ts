import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryGeneratedColumn,
    UpdateDateColumn,
} from "typeorm";
import {Users} from "./user.model";

@Entity("fcm_tokens")
class FcmTokens extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id: string;

    @ManyToOne(() => Users)
    @JoinColumn({name: "userId"})
    user: Users;

    @Column({
        type: "varchar",
        unique: true,
        nullable: false,
        length: 2048
    })
    token: string;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    FcmTokens,
}
