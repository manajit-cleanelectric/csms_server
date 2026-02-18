import {
    BaseEntity,
    BeforeRemove,
    Column,
    Entity,
    JoinColumn,
    ManyToOne,
    PrimaryGeneratedColumn
} from "typeorm";
import {Vehicles} from "./vehicle.model";
import {deleteImageFromDisk} from "../utils/helperFunctions";

@Entity("images")
class Image extends  BaseEntity {
    @PrimaryGeneratedColumn({
        type: "bigint",
        unsigned: true,
    })
    id!: string;

    @Column({
        type: "varchar",
        nullable: true,
        length: 32
    })
    title!: string;

    @Column({
        type: "varchar",
        nullable: false,
        length: 256
    })
    url!: string;

    @ManyToOne(() => Vehicles, (vehicle) => vehicle.proofImages, {
        orphanedRowAction: "delete",
        onDelete: "CASCADE",
    })
    @JoinColumn({name: "vehicleId"})
    vehicle!: Vehicles;

    @BeforeRemove()
    async removeFileFromStorage() {
        deleteImageFromDisk(this.url);
    }
}

export {
    Image,
};

