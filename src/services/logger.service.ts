import {pino} from "pino";

const logger = pino({
    name: "server start",
    transport: {
        target: "pino-pretty",
        options: {
            colorize: true,
            ignore: 'pid,hostname,name',
            translateTime: 'SYS:standard',
        }
    }
});

export {
    logger,
}