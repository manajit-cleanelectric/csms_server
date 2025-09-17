import {
    BaseEntity,
    BeforeInsert,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryColumn,
    UpdateDateColumn
} from "typeorm";
import {SampledValues} from "./sampledValue.model";
import {v7} from "uuid";

@Entity("meterValues")
class MeterValues extends BaseEntity {
    @PrimaryColumn("uuid")
    id!: string;

    @Column({
        type: "uuid",
        nullable: false
    })
    chargerId!: string;

    @Column({
        type: "int",
        nullable: false,
        default: 0
    })
    connectorId!: number;

    @Column({
        type: "timestamptz",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp!: Date;

    @Column({
        type: "int",
        nullable: false,
        unsigned: true
    })
    sessionId!: number;

    @OneToMany(() => SampledValues, (sampledValue) => sampledValue.meterValue, {cascade: ["insert"]})
    sampledValues!: SampledValues[];

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @BeforeInsert()
    generateId() {
        this.id = v7();
    }
}

export {
    MeterValues
};