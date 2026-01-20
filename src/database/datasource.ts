import "reflect-metadata"
import {DataSource} from "typeorm"
import {Users} from "../models/user.model";
import {Chargers} from "../models/charger.model";
import {MeterValues} from "../models/meterValue.model";
import {SampledValues} from "../models/sampledValue.model";
import {Sessions} from "../models/session.model";
import {Heartbeats} from "../models/heartbeat.model";
import {StatusLogs} from "../models/statusLog.model";
import {Vehicles} from "../models/vehicle.model";
import {Connectors} from "../models/connector.model";
import {Addresses} from "../models/address.model";
import {AuthTokens} from "../models/authToken.model";
import {Tariffs} from "../models/tariff.model";
import {LedgerEntry} from "../models/LedgerEntry.model";
import {Wallet} from "../models/wallet.model";
import {Transaction} from "../models/transaction.model";
import {PaymentRequest} from "../models/paymentOrders.model";
import {FcmTokens} from "../models/fcmToken.model";
import {Image} from "../models/image.model";
import {InitSchema1766561360524} from "../migrations/1766561360524-InitSchema";
import {RemoveIndexRCNumberOnVehicles1766565854393} from "../migrations/1766565854393-RemoveIndexRCNumberOnVehicles";
import {AddImagesSchema1767178984153} from "../migrations/1767178984153-AddImagesSchema";
import {AddVehicleStatus1768904448203} from "../migrations/1768904448203-AddVehicleStatus";

const AppDataSource = new DataSource({
    type: "postgres",
    host: process.env.DATABASE_HOST,
    port: parseInt(process.env.DATABASE_PORT!, 10),
    username: process.env.DATABASE_USERNAME,
    password: process.env.DATABASE_PASSWORD,
    database: process.env.DATABASE_NAME,
    entities: [
        Users,
        AuthTokens,
        Vehicles,
        Chargers,
        Connectors,
        Addresses,
        Sessions,
        MeterValues,
        SampledValues,
        Heartbeats,
        Tariffs,
        StatusLogs,
        LedgerEntry,
        Transaction,
        Wallet,
        PaymentRequest,
        FcmTokens,
        Image,
    ],
    // synchronize: true,
    logging: false,

    // Migrations can be added here if needed
    migrationsRun: false,
    migrationsTableName: 'migrations',
    migrationsTransactionMode: "each",
    migrations: [
        InitSchema1766561360524,
        RemoveIndexRCNumberOnVehicles1766565854393,
        AddImagesSchema1767178984153,
        AddVehicleStatus1768904448203,
    ],
})
export { AppDataSource };

// TODO make synchronize false