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

import {Status} from "./sessions";

@Entity("statusLogs")
class StatusLogs extends BaseEntity {
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
        type: "enum",
        enum: Status,
    })
    status!: Status;

    @Column({
        type: "datetime",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp!: Timestamp;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    StatusLogs
};