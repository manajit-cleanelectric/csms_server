import {BaseEntity, Column, Entity, JoinColumn, ManyToOne, PrimaryGeneratedColumn} from "typeorm";
import {MeterValues} from "./meterValues";

enum ReadingContext {
    INTERUPPTION_BEGIN = "Interruption.Begin",
    INTERUPPTION_END = "Interruption.End",
    OTHER = "Other",
    SAMPLE_CLOCK = "Sample.Clock",
    SAMPLE_PERIODIC = "Sample.Periodic",
    TRANSACTION_BEGIN = "Transaction.Begin",
    TRANSACTION_END = "Transaction.End",
    TRIGGER = "Trigger",
}

enum ValueFormat {
    RAW = "Raw",
    SIGNED_DATA = "SignedData",
}

enum Measurand {
    CURRENT_EXPORT = "Current.Export",
    CURRENT_IMPORT = "Current.Import",
    CURRENT_OFFERED = "Current.Offered",
    ENERGY_ACTIVE_EXPORT_REGISTER = "Energy.Active.Export.Register",
    ENERGY_ACTIVE_IMPORT_REGISTER = "Energy.Active.Import.Register",
    ENERGY_REACTIVE_EXPORT_REGISTER = "Energy.Reactive.Export.Register",
    ENERGY_REACTIVE_IMPORT_REGISTER = "Energy.Reactive.Import.Register",
    ENERGY_ACTIVE_EXPORT_INTERVAL = "Energy.Active.Export.Interval",
    ENERGY_ACTIVE_IMPORT_INTERVAL = "Energy.Active.Import.Interval",
    ENERGY_REACTIVE_EXPORT_INTERVAL = "Energy.Reactive.Export.Interval",
    ENERGY_REACTIVE_IMPORT_INTERVAL = "Energy.Reactive.Import.Interval",
    FREQUENCY = "Frequency",
    POWER_ACTIVE_EXPORT = "Power.Active.Export",
    POWER_ACTIVE_IMPORT = "Power.Active.Import",
    POWER_FACTOR = "Power.Factor",
    POWER_OFFERED = "Power.Offered",
    POWER_REACTIVE_EXPORT = "Power.Reactive.Export",
    POWER_REACTIVE_IMPORT = "Power.Reactive.Import",
    RPM = "RPM",
    SoC = "SoC",
    TEMPERATURE = "Temperature",
    VOLTAGE = "Voltage",
}

enum Phase {
    L1 = "L1",
    L2 = "L2",
    L3 = "L3",
    N = "N",
    L1_N = "L1-N",
    L2_N = "L2-N",
    L3_N = "L3-N",
    L1_L2 = "L1-L2",
    L2_L3 = "L2-L3",
    L3_L1 = "L3-L1",
    NO_PHASE = "NoPhase",
}

enum Location {
    BODY = "Body",
    CABLE = "Cable",
    EV = "EV",
    INLET = "Inlet",
    OUTLET = "Outlet",
}

enum UnitOfMeasure {
    WATT_HOUR = "Wh",
    KILOWATT_HOUR = "kWh",
    VAR_HOUR = "varh",
    KILOVAR_HOUR = "kvarh",
    WATT = "W",
    KILOWATT = "kW",
    VOLT_AMPERE = "VA",
    KILOVOLT_AMPERE = "kVA",
    VAR = "var",
    KILOVAR = "kvar",
    AMPERE = "A",
    VOLT = "V",
    CELSIUS = "Celsius",
    FAHRENHEIT = "Fahrenheit",
    KELVIN = "Kelvin",
    PERCENT = "Percent",
}

@Entity("sampledValues")
class SampledValues extends BaseEntity{
    @PrimaryGeneratedColumn("uuid")
    id!: string;

    @ManyToOne(() => MeterValues, (meterValue) => meterValue.sampledValues)
    @JoinColumn({name: "meterValueId"})
    meterValue!: MeterValues;

    @Column({
        type: "varchar",
        nullable: true,
        length: 256
    })
    stringValue?: string;

    @Column({
        type: "decimal",
        precision: 10,
        scale: 2,
        nullable: true
    })
    decimalValue?: number;

    @Column({
        type: "int",
        nullable: true,
    })
    integerValue?: number;

    @Column({
        type: "enum",
        enum: ReadingContext,
        default: ReadingContext.SAMPLE_PERIODIC,
    })
    context: ReadingContext;

    @Column({
        type: "enum",
        enum: ValueFormat,
        default: ValueFormat.RAW,
    })
    format?: ValueFormat;

    @Column({
        type: "enum",
        enum: Measurand,
        default: Measurand.ENERGY_ACTIVE_IMPORT_REGISTER,
    })
    measurand?: Measurand;

    @Column({
        type: "enum",
        enum: Phase,
        default: Phase.NO_PHASE,
    })
    phase?: Phase;

    @Column({
        type: "enum",
        enum: Location,
        default: Location.OUTLET,
    })
    location?: Location;

    @Column({
        type: "enum",
        enum: UnitOfMeasure,
        default: UnitOfMeasure.WATT_HOUR,
    })
    unit?: UnitOfMeasure;
}

export {
    SampledValues,
    ReadingContext,
    ValueFormat,
    Measurand,
    Phase,
    Location,
    UnitOfMeasure,
}