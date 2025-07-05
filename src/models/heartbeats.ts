import {
    Entity,
    PrimaryGeneratedColumn,
    Column,
    BaseEntity,
    UpdateDateColumn,
    CreateDateColumn,
    Timestamp, Check,
    ManyToOne, OneToMany, OneToOne
} from "typeorm";

@Entity("heartbeats")
class Heartbeats extends BaseEntity {
    @PrimaryGeneratedColumn({
        type: "int",
        unsigned: true
    })
    id!: number;

    @Column({
        type: "int",
        nullable: false
    })
    chargerId!: number;

    @Column({
        type: "timestamp",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp!: Date;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    Heartbeats
};
