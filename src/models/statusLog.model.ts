import {BaseEntity, BeforeInsert, Column, CreateDateColumn, Entity, PrimaryColumn, UpdateDateColumn} from "typeorm";
import {ConnectorStatus} from "./connector.model";
import {v7} from "uuid";

enum ErrorCode {
    CONNECTOR_LOCK_FAILURE = "ConnectorLockFailure",
    EV_COMMUNICATION_ERROR = "EVCommunicationError",
    GROUND_FAILURE = "GroundFailure",
    HIGH_TEMPERATURE = "HighTemperature",
    INTERNAL_ERROR = "InternalError",
    LOCAL_LIST_CONFLICT = "LocalListConflict",
    NO_ERROR = "NoError",
    OTHER_ERROR = "OtherError",
    OVERCURRENT_FAILURE = "OvercurrentFailure",
    OVERVOLTAGE = "OverVoltage",
    POWER_METER_FAILURE = "PowerMeterFailure",
    POWER_SWITCH_FAILURE = "PowerSwitchFailure",
    READER_FAILURE = "ReaderFailure",
    RESET_FAILURE = "ResetFailure",
    UNDER_VOLTAGE = "UnderVoltage",
    UNLOCK_FAILURE = "UnlockFailure",
}

@Entity("statusLogs")
class StatusLogs extends BaseEntity {
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
        type: "enum",
        enum: ErrorCode,
        default: ErrorCode.NO_ERROR
    })
    errorCode!: ErrorCode;

    @Column({
        type: "enum",
        enum: ConnectorStatus,
    })
    status!: ConnectorStatus;

    @Column({
        type: "varchar",
        length: 50,
        nullable: true
    })
    info!: string;

    @Column({
        type: "varchar",
        length: 255,
        nullable: true
    })
    vendorId!: string;

    @Column({
        type: "varchar",
        length: 50,
        nullable: true
    })
    vendorErrorCode!: string;

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
    StatusLogs,
    ErrorCode,
};