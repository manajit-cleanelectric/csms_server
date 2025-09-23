import {
    BaseEntity, BeforeInsert,
    Column,
    CreateDateColumn,
    Entity, JoinColumn, ManyToOne,
    PrimaryColumn,
    UpdateDateColumn,
} from "typeorm"
import {Users} from "./user.model";
import {v7} from "uuid";

enum PaymentRequestStatus {
    INITIALISED = 'initialised',
    PENDING = 'pending',
    COMPLETED = 'completed',
    FAILED = 'failed',
}

@Entity("payment_gateway_orders")
class PaymentRequest extends BaseEntity {
    @PrimaryColumn("uuid")
    id: string;

    @ManyToOne(() => Users)
    @JoinColumn({name: "userId"})
    user: Users;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    orderId: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128
    })
    amount: string;

    @Column({
        type: "varchar",
        unique: false,
        nullable: false,
        length: 128,
        default: "INR"
    })
    currency: string;


    @Column({
        type: 'enum',
        enum: PaymentRequestStatus,
        default: PaymentRequestStatus.INITIALISED,
    })
    status: string;

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
    PaymentRequest,
    PaymentRequestStatus
}