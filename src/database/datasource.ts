import "reflect-metadata"
import { DataSource } from "typeorm"
import { Users } from "../models/users";
import { Chargers} from "../models/charger";
import { DATABASE_HOST, DATABASE_PORT, DATABASE_NAME, DATABASE_USERNAME, DATABASE_PASSWORD} from "../app";
import {MeterValues} from "../models/meterValues";
import {Sessions} from "../models/sessions";
import {Heartbeats} from "../models/heartbeats";
import {StatusLogs} from "../models/statusLogs";

const AppDataSource = new DataSource({
    type: "postgres",
    host: DATABASE_HOST,
    port: DATABASE_PORT,
    username: DATABASE_USERNAME,
    password: DATABASE_PASSWORD,
    database: DATABASE_NAME,
    entities: [Users, Chargers, MeterValues, Sessions, Heartbeats, StatusLogs],
    synchronize: true,
    logging: false,
})
export { AppDataSource };

// TODO make synchronize false