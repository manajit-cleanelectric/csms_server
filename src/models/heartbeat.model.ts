import {BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {v7} from "uuid";

@Entity("heartbeats")
class Heartbeats extends BaseEntity {
    @PrimaryColumn("uuid")
    id!: string;

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

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }
}

export {
    Heartbeats
};
