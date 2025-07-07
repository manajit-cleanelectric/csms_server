import { Entity, PrimaryGeneratedColumn, Column, BaseEntity } from 'typeorm';

@Entity()
export class Address extends BaseEntity {
    @PrimaryGeneratedColumn()
    id: number;

    @Column()
    line1: string;

    @Column()
    line2: string;

    @Column()
    city: string;

    @Column()
    state: string;

    @Column()
    zipcode: string;

    @Column()
    country: string;

    @Column()
    createAt: Date;

    @Column()
    updateAt: Date;
}
