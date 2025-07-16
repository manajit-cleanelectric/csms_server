import {BaseEntity, Column, CreateDateColumn, Entity, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";

@Entity("heartbeats")
class Heartbeats extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: number;

    @Column({
        type: "uuid",
        nullable: false
    })
    chargerId!: string;

    @Column({
        type: "timestamptz",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP",
    })
    timestamp!: Date;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    Heartbeats
};
