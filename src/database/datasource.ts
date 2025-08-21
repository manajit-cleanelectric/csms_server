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
        StatusLogs,
        Tariffs,
    ],
    synchronize: true,
    logging: false,
})
export { AppDataSource };

// TODO make synchronize false