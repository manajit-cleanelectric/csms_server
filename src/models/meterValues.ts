import {BaseEntity, Column, CreateDateColumn, Entity, OneToMany, PrimaryGeneratedColumn, UpdateDateColumn} from "typeorm";
import {SampledValues} from "./sampledValues";

@Entity("meterValues")
class MeterValues extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
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
}

export {
    MeterValues
};