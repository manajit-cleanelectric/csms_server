import "reflect-metadata"
import {DataSource} from "typeorm"
import {Users} from "../models/users";
import {Chargers} from "../models/charger";
import {DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USERNAME} from "../app";
import {MeterValues} from "../models/meterValues";
import {Sessions} from "../models/sessions";
import {Heartbeats} from "../models/heartbeats";
import {StatusLogs} from "../models/statusLogs";
import {Vehicles} from "../models/vehicle";
import {Connectors} from "../models/connector";
import {Addresses} from "../models/address";
import {AuthTokens} from "../models/authTokens";
import {LedgerEntry} from "../models/LedgerEntry";
import {Wallet} from "../models/wallets";
import {Transaction} from "../models/Transaction";

const AppDataSource = new DataSource({
    type: "postgres",
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [Users, AuthTokens, Vehicles, Chargers, Connectors, Addresses, Sessions, MeterValues, Heartbeats, StatusLogs, LedgerEntry, Transaction, Wallet],
    synchronize: true,
    logging: false,
})
export { AppDataSource };

// TODO make synchronize false