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

@Entity("meterValues")
class MeterValues extends BaseEntity {
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
        type: "int",
        nullable: false,
        default: 0
    })
    connectorId!: number;

    @Column({
        type: "datetime",
        nullable: false,
        default: () => "CURRENT_TIMESTAMP"
    })
    timestamp!: Date;

    @Column({
        type: "varchar",
        nullable: false,
        length: 64
    })
    sessionId!: string;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    currentImport!: number;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    energyActiveImportRegister!: number;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    powerActiveImport!: number;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    soc!: number;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    voltage!: number;

    @Column({
        type: "float",
        nullable: false,
        default: 0.0
    })
    temperature!: number;

    @UpdateDateColumn()
    updatedAt!: Date;

    @CreateDateColumn()
    createdAt!: Date;
}

export {
    MeterValues
};