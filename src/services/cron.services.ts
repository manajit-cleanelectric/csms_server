import {AppDataSource} from "../database/datasource";
import {Chargers, ChargerStatus} from "../models/charger";
import {logger} from "../app";
import cron from "node-cron";
import {SessionStatus} from "../models/sessions";


const scheduleHeartbeatJob = () => {
    cron.schedule('* * * * *', async () => {
        const minutes = 5;
        const currentTime = new Date(new Date().getTime() - minutes * 60 * 1000);
        logger.info(`Running cron job`);
        await AppDataSource
            .getRepository(Chargers)
            .createQueryBuilder()
            .update(Chargers)
            .set({ status: ChargerStatus.UNKNOWN })
            .where("lastHeartBeat < :currentTime", { currentTime })
            .execute();

        const subQuery = AppDataSource
            .getRepository(Chargers)
            .createQueryBuilder('c')
            .select('c.id')
            .where('c.lastHeartBeat < :currentTime', { currentTime })
            .getQuery();

        await AppDataSource
            .getRepository('sessions')
            .createQueryBuilder()
            .update()
            .set({ status: SessionStatus.FAULTED })
            .where(
                `chargerId IN (${subQuery})`
            )
            .andWhere(
                "status IN (:...status)",
                { status: [SessionStatus.FINISHING, SessionStatus.CHARGING, SessionStatus.PREPARING] }
            )
            .setParameters({ currentTime })
            .execute();
    });
};

export {
    scheduleHeartbeatJob,
}