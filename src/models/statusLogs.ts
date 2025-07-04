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
        type: "enum",
        enum: ErrorCode,
        default: ErrorCode.NO_ERROR
    })
    errorCode!: ErrorCode;

    @Column({
        type: "enum",
        enum: Status,
    })
    status!: Status;

    @CreateDateColumn()
    createdAt!: Date;

    @UpdateDateColumn()
    updatedAt!: Date;
}

export {
    StatusLogs
};