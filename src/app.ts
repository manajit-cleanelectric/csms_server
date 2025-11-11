import {config} from "dotenv";
import cors from "cors";
import express, {type Express} from "express";
import {logger} from "./services/logger.service";
import {rateLimit} from 'express-rate-limit'
import {RedisStore} from 'rate-limit-redis';
import Redis from "ioredis";
import * as fs from 'fs';
import * as path from 'path';
import client, { Counter, Registry } from 'prom-client';
import {NextFunction, Request, Response} from 'express';

config();


const app: Express = express();

const JWT_SECRET_KEY = process.env.JWT_SECRET_KEY!;
const REFRESH_TOKEN_SECRET_KEY = process.env.REFRESH_TOKEN_SECRET_KEY!;
const DATABASE_HOST = process.env.DATABASE_HOST!;
const DATABASE_PORT = parseInt(process.env.DATABASE_PORT!, 10);
const DATABASE_NAME = process.env.DATABASE_NAME!;
const DATABASE_USERNAME = process.env.DATABASE_USERNAME!;
const DATABASE_PASSWORD = process.env.DATABASE_PASSWORD!;
const SERVER_PORT = parseInt(process.env.SERVER_PORT!, 10);
const SERVER_HOST = process.env.SERVER_HOST!;
const REDIS_HOST = process.env.REDIS_HOST!;
const REDIS_PORT = parseInt(process.env.REDIS_PORT!, 10);
const REDIS_PASSWORD = process.env.REDIS_PASSWORD!;
const RATE_LIMITER_WINDOW_SIZE = parseInt(process.env.RATE_LIMITER_WINDOW_SIZE!, 10);
const RATE_LIMITER_LIMIT = parseInt(process.env.RATE_LIMITER_LIMIT!, 10);
const OTP_LENGTH = parseInt(process.env.OTP_LENGTH!, 10);
const STATIC_FOLDER = process.env.STATIC_FOLDER!;
const MEDIA_FOLDER = process.env.MEDIA_FOLDER!;
const RC_IMAGE_FOLDER = process.env.RC_IMAGE_FOLDER!;
const SMS_SERVICE_PROVIDER_URL = process.env.SMS_SERVICE_PROVIDER_URL!;
const SMS_SERVICE_PROVIDER_API_KEY = process.env.SMS_SERVICE_PROVIDER_API_KEY!;
const RAZORPAY_API_KEY_ID = process.env.RAZORPAY_API_KEY_ID!;
const RAZORPAY_API_KEY_SECRET = process.env.RAZORPAY_API_KEY_SECRET!;
const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET!;
const EMAIL_ACCOUNT_ID = process.env.EMAIL_ACCOUNT_ID!;
const EMAIL_APP_PASSWORD = process.env.EMAIL_APP_PASSWORD!;
const SERVER_URL = process.env.SERVER_URL!;
const ID_CODEC_KEY = process.env.ID_CODEC_KEY!;
const WALLET_MIN_BALANCE = parseInt(process.env.WALLET_MIN_BALANCE!, 10);

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
if (!SERVER_HOST) {
    throw new Error('SERVER_HOST is not defined in environment variables.');
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
if (!STATIC_FOLDER) {
    throw new Error('STATIC_FOLDER is not defined in environment variables.');
} else {
    const dirPath = path.join(__dirname, '../', STATIC_FOLDER);
    ensureDirExistsSync(dirPath);
}
if (!MEDIA_FOLDER) {
    throw new Error('MEDIA_FOLDER is not defined in environment variables.');
} else {
    const dirPath = path.join(__dirname, '../', STATIC_FOLDER, MEDIA_FOLDER);
    ensureDirExistsSync(dirPath);
}
if (!RC_IMAGE_FOLDER) {
    throw new Error('RC_IMAGE_FOLDER is not defined in environment variables.');
} else {
    const dirPath = path.join(__dirname, '../', STATIC_FOLDER, MEDIA_FOLDER, RC_IMAGE_FOLDER);
    ensureDirExistsSync(dirPath);
}
if (!SMS_SERVICE_PROVIDER_URL) {
    throw new Error('SMS_SERVICE_PROVIDER_URL is not defined in environment variables.');
}
if (!SMS_SERVICE_PROVIDER_API_KEY) {
    throw new Error('SMS_SERVICE_PROVIDER_API_KEY is not defined in environment variables.');
}
if (!RAZORPAY_API_KEY_ID) {
    throw new Error('RAZORPAY_API_KEY_ID is not defined in environment variables.');
}
if (!RAZORPAY_API_KEY_SECRET) {
    throw new Error('RAZORPAY_API_KEY_SECRET is not defined in environment variables.');
}
if (!RAZORPAY_WEBHOOK_SECRET) {
    throw new Error('RAZORPAY_WEBHOOK_SECRET is not defined in environment variables.');
}
if (!EMAIL_ACCOUNT_ID) {
    throw new Error('EMAIL_ACCOUNT_ID is not defined in environment variables.');
}
if (!EMAIL_APP_PASSWORD) {
    throw new Error('EMAIL_APP_PASSWORD is not defined in environment variables.');
}
if (!SERVER_URL) {
    throw new Error('SERVER_URL is not defined in environment variables.');
}
if (!ID_CODEC_KEY) {
    throw new Error('ID_CODEC_KEY is not defined in environment variables.');
}
if (!WALLET_MIN_BALANCE) {
    throw new Error('WALLET_MIN_BALANCE is not defined in environment variables.');
}

function ensureDirExistsSync(dirPath: string): void {
    if (!fs.existsSync(dirPath)) {
        fs.mkdirSync(dirPath, {recursive: true});
        logger.info(`Directory created: ${dirPath}`);
    }
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


// Import routes
import {router as userRoutes} from "./routes/user.routes";
import {router as chargerRoutes} from "./routes/charger.routes";
import {router as sessionRoutes} from "./routes/session.routes";
import {router as vehicleRoutes} from "./routes/vehicle.routes";
import {router as walletRoutes} from "./routes/wallet.routes";
import {router as paymentRoutes} from "./routes/payment.routes";

// Middlewares
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors());
app.use(express.json());
app.use(userRoutes);
app.use(chargerRoutes);
app.use(sessionRoutes);
app.use(vehicleRoutes);
app.use(walletRoutes);
app.use(paymentRoutes);
app.use(express.static(path.join(__dirname, '../', STATIC_FOLDER)));
const STATIC_FOLDER_PATH = path.join(__dirname, '../', STATIC_FOLDER);
logger.info(path.join(__dirname, '../', STATIC_FOLDER));
// Create a Registry to register all metrics
const register: Registry = new client.Registry();

// Collect default system metrics (CPU, memory, etc.)
client.collectDefaultMetrics({ register });

// Define a custom counter metric for HTTP requests
const httpRequestCounter = new Counter({
    name: 'http_requests_total',
    help: 'Total number of HTTP requests received',
    labelNames: ['method', 'route', 'status_code'] as const,
});

// Register the custom metric
register.registerMetric(httpRequestCounter);

// Middleware to count requests
app.use((req: Request, res: Response, next: NextFunction) => {
    res.on('finish', () => {
        const route = req.route ? req.route.path : req.path;
        httpRequestCounter.labels(req.method, route, res.statusCode.toString()).inc();
    });
    next();
});


// Metrics endpoint
app.get('/metrics', async (req: Request, res: Response) => {
    try {
        res.setHeader('Content-Type', register.contentType);
        const metrics = await register.metrics();
        res.send(metrics);
    } catch (err) {
        res.status(500).send((err as Error).message);
    }
});

export {
    app,
    JWT_SECRET_KEY,
    REFRESH_TOKEN_SECRET_KEY,
    DATABASE_HOST,
    DATABASE_PORT,
    DATABASE_NAME,
    DATABASE_USERNAME,
    DATABASE_PASSWORD,
    SERVER_PORT,
    SERVER_HOST,
    apiLimiter,
    redisClient,
    OTP_LENGTH,
    STATIC_FOLDER,
    STATIC_FOLDER_PATH,
    MEDIA_FOLDER,
    RC_IMAGE_FOLDER,
    SMS_SERVICE_PROVIDER_URL,
    SMS_SERVICE_PROVIDER_API_KEY,
    RAZORPAY_API_KEY_ID,
    RAZORPAY_API_KEY_SECRET,
    RAZORPAY_WEBHOOK_SECRET,
};
