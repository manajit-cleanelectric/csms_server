import {Request, Response, Router} from 'express';
import {
    getOngoingSession,
    getSession,
    listAllChargerSessions,
    listAllUserSessions,
    sendRemoteStopTransaction
} from '../controllers/session.controller';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger} from "../services/logger.service";
import {UserRoles} from "../models/user.model";
import {handleError} from "../errors/customErrors";


const router: Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const {sessionId} = req.params;
        const session = await getSession(Number(sessionId));
        res.status(200).send({success: true, message: "Session details retrieved", data: session});
        logger.info(`Sent session with ID ${sessionId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/user/:userId/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        let {startDate, endDate, page = 1, limit = 10} = req.query;

        // Ensure page and limit are numbers
        page = Number(page);
        limit = Number(limit);

        // Cast to string for date processing
        startDate = startDate as string | undefined;
        endDate = endDate as string | undefined;

        // Validate page and limit (optional: you can add constraints for minimums or maximums)
        if (isNaN(page) || page < 1) page = 1;
        if (isNaN(limit) || limit < 1) limit = 10;
        let startTime = new Date();
        let endTime = new Date();

        // Handle the startDate and endDate
        if (startDate) {
            startTime = new Date(startDate);
            // If the startDate is invalid, we reset to epoch
            if (isNaN(startTime.getTime())) startTime = new Date(0);
        } else {
            startTime = new Date(0);  // Default to epoch if not provided
        }

        if (endDate) {
            endTime = new Date(endDate);
            // If the endDate is invalid, set to current date
            if (isNaN(endTime.getTime())) endTime = new Date();
        } else {
            endTime = new Date();  // Default to the current date if not provided
        }

        const sessions = await listAllUserSessions(userId, page, limit, startTime, endTime);
        res.status(200).send({success: true, message: "User sessions retrieved", data: sessions});
        logger.info(`Sent sessions for user with ID ${userId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/chargers/:chargerId/sessions', authenticate, authorize(UserRoles.ADMINISTRATOR), async (req: Request, res: Response) => {
    try {
        const {chargerId} = req.params;
        const sessions = await listAllChargerSessions(chargerId);
        res.status(200).send({success: true, message: "Charger sessions retrieved", data: sessions});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.post('/api/users/:userId/session/remote-stop-transaction', authenticate, async (req: Request, res: Response) => {
    try {
        const {chargerId, transactionId} = req.body;
        const status = await sendRemoteStopTransaction(chargerId, transactionId);
        if (!status) {
            res.status(200).send({
                success: false,
                message: "Transaction Stop Request could not be sent.",
                data: null
            });
            return;
        }
        res.status(200).send({success: true, message: "Transaction Stop Request Sent", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/user/:userId/ongoing-session', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const session = await getOngoingSession(userId);
        res.status(200).send({success: true, message: "Ongoing sessions retrieved", data: session});
        logger.info(`Sent ongoing session for User ID ${userId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

export {
    router
}