import {
    BaseEntity,
    Column,
    CreateDateColumn,
    Entity,
    OneToMany,
    PrimaryGeneratedColumn,
    UpdateDateColumn
} from "typeorm";
import {Chargers} from "./charger.model";

@Entity("tariffs")
class Tariffs extends BaseEntity {
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @Column({
        type: "decimal",
        precision: 7,
        scale: 2,
        default: 0.00,
    })
    pricePerKWh!: number;

    @Column({
        type: "decimal",
        precision: 7,
        scale: 2,
        default: 0.00,
    })
    CGST!: number;

    @Column({
        type: "decimal",
        precision: 7,
        scale: 2,
        default: 0.00,
    })
    SGST!: number;

    @Column({
        type: "decimal",
        precision: 7,
        scale: 2,
        default: 0.00,
    })
    IGST!: number;

    @OneToMany(() => Chargers, (charger) => charger.tariff)
    chargers!: Chargers[];

    @CreateDateColumn({type: 'timestamptz'})
    createdAt!: Date;

    @UpdateDateColumn({type: 'timestamptz'})
    updatedAt!: Date;
}

export {
    Tariffs,
};