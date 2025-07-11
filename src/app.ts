import {config} from "dotenv";

config();

import cors from "cors";
import express, {type Express} from "express";
import {pino} from "pino";


const app: Express = express();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY!;
const DATABASE_HOST = process.env.DATABASE_HOST!;
const DATABASE_PORT = parseInt(process.env.DATABASE_PORT!, 10);
const DATABASE_NAME = process.env.DATABASE_NAME!;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME!;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD!;
const SERVER_PORT = parseInt(process.env.SERVER_PORT!, 10);

if (!JWT_SECRET_KEY) {
    throw new Error('JWT_SECRET_KEY is not defined in environment variables.');
}
if (!REFRESH_TOKEN_SECRET_KEY) {
    throw new Error('REFRESH_TOKEN_SECRET_KEY is not defined in environment variables.');
}
if (!DATABASE_HOST) {
    throw new Error('DATABASE_HOST is not defined in environment variables.');
}
if (!DATABASE_PORT) {
    throw new Error('DATABASE_PORT is not defined in environment variables.');
}
if (!DATABASE_NAME) {
    throw new Error('DATABASE_NAME is not defined in environment variables.');
}
if (!DATABASE_USERNAME) {
    throw new Error('DATABASE_USERNAME is not defined in environment variables.');
}
if (!DATABASE_PASSWORD) {
    throw new Error('DATABASE_PASSWORD is not defined in environment variables.');
}
if (!SERVER_PORT) {
    throw new Error('SERVER_PORT is not defined in environment variables.');
}


// Set the application to trust the reverse proxy
app.set("trust proxy", true);
const logger = pino({name: "server start"});

import {router as userRoutes} from "./routes/userRoutes";
import {router as chargerRoutes} from "./routes/chargerRoutes";
import {router as sessionRoutes} from "./routes/sessionRoutes";
import {router as vehicleRoutes} from "./routes/vehicleRoutes";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(chargerRoutes);
app.use(sessionRoutes);
app.use(vehicleRoutes);

export {
    app,
    logger,
    JWT_SECRET_KEY,
    REFRESH_TOKEN_SECRET_KEY,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    SERVER_PORT,
};
