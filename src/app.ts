import {config} from "dotenv";

config();

import cors from "cors";
import express, {type Express} from "express";
import {pino} from "pino";
import {rateLimit} from 'express-rate-limit'
import {RedisStore} from 'rate-limit-redis';
import Redis from "ioredis";



const app: Express = express();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY!;
const DATABASE_HOST = process.env.DATABASE_HOST!;
const DATABASE_PORT = parseInt(process.env.DATABASE_PORT!, 10);
const DATABASE_NAME = process.env.DATABASE_NAME!;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME!;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD!;
const SERVER_PORT = parseInt(process.env.SERVER_PORT!, 10);
const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PORT = parseInt(process.env.REDIS_PORT!, 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD!;
const RATE_LIMITER_WINDOW_SIZE = parseInt(process.env.RATE_LIMITER_WINDOW_SIZE!, 10);
const RATE_LIMITER_LIMIT = parseInt(process.env.RATE_LIMITER_LIMIT!, 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH!, 10);

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
if (!REDIS_HOST) {
    throw new Error('REDIS_HOST is not defined in environment variables.');
}
if (!REDIS_PORT) {
    throw new Error('REDIS_PORT is not defined in environment variables.');
}
if (!REDIS_PASSWORD) {
    throw new Error('REDIS_PASSWORD is not defined in environment variables.');
}
if (!RATE_LIMITER_WINDOW_SIZE) {
    throw new Error('RATE_LIMITER_WINDOW_SIZE is not defined in environment variables.');
}
if (!RATE_LIMITER_LIMIT) {
    throw new Error('RATE_LIMITER_LIMIT is not defined in environment variables.');
}
if (!OTP_LENGTH) {
    throw new Error('OTP_LENGTH is not defined in environment variables.');
}


// Set up Redis client
// TODO add password to redis
const redisClient = new Redis({
    host: REDIS_HOST, // Redis host
    port: REDIS_PORT,        // Redis port
    // password: REDIS_PASSWORD, // if needed
});

// Create rate limiter with Redis store
const apiLimiter = rateLimit({
    windowMs: RATE_LIMITER_WINDOW_SIZE, // 1-minute window
    limit: RATE_LIMITER_LIMIT, // Limit each IP to 5 requests per windowMs
    standardHeaders: true, // Add RateLimit headers to response
    legacyHeaders: false,  // Disable X-RateLimit-* headers
    store: new RedisStore({
        sendCommand: (...args: Parameters<typeof redisClient.call>) => redisClient.call(...args) as unknown as Promise<any>,
        prefix: 'rate-limit:'
    }),
    message: {
        success: 'false',
        message: 'You have exceeded the request limit. Please try again later.',
        data: null
    },
});

// Set the application to trust the reverse proxy
app.set("trust proxy", 'loopback');
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
    apiLimiter,
    redisClient,
    OTP_LENGTH,
};
