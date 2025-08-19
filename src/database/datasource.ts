import "reflect-metadata"
import {DataSource} from "typeorm"
import {Users} from "../models/user.model";
import {Chargers} from "../models/charger.model";
import {DATABASE_HOST, DATABASE_NAME, DATABASE_PASSWORD, DATABASE_PORT, DATABASE_USERNAME} from "../app";
import {MeterValues} from "../models/meterValue.model";
import {SampledValuesModel} from "../models/sampledValue.model";
import {Sessions} from "../models/session.model";
import {Heartbeats} from "../models/heartbeat.model";
import {StatusLogsModel} from "../models/statusLog.model";
import {Vehicles} from "../models/vehicle.model";
import {Connectors} from "../models/connector.model";
import {Addresses} from "../models/address.model";
import {AuthTokens} from "../models/authToken.model";

const AppDataSource = new DataSource({
    type: "postgres",
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [
        Users,
        AuthTokens,
        Vehicles,
        Chargers,
        Connectors,
        Addresses,
        Sessions,
        MeterValues,
        SampledValuesModel,
        Heartbeats,
        StatusLogsModel
    ],
    synchronize: true,
    logging: false,
})
export { AppDataSource };

// TODO make synchronize false