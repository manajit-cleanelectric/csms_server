import {Request, Response, Router} from 'express';
import {
    getOngoingSession, getOngoingSessionV2,
    getSession, getSessionInvoiceDetails,
    listAllChargerSessions,
    listAllUserSessions, listUserSessionsV2,
    sendRemoteStopTransaction
} from '../controllers/session.controller';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger} from "../services/logger.service";
import {UserRoles} from "../models/user.model";
import {handleError} from "../errors/customErrors";
import {encodeSessionIdRandomized} from "../services/idCodec.service";
import {parseDate} from "../utils/money";


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

router.get('/api/v2/user/:userId/sessions', authenticate, async (req: Request, res: Response) => {
    const { userId } = req.params;
    const { startDate, endDate, cursor, limit } = req.query;

    // Validate and parse pagination parameters
    const parsedLimit = Math.min(Math.max(Number(limit) || 20, 1), 100);
    const parsedCursor = cursor
        ? String(cursor)
        : encodeSessionIdRandomized(2**31 - 1, process.env.ID_CODEC_KEY!);

    // Parse and validate dates
    const startTime = parseDate(startDate as string | undefined, new Date(0));
    const endTime = parseDate(endDate as string | undefined, new Date());

    // Validate date range
    if (startTime > endTime) {
        res.status(400).send({
            success: false,
            message: "Invalid date range: startDate must be before endDate",
            data: null
        });
        return;
    }
    const {data, metadata} = await listUserSessionsV2(userId, parsedLimit, parsedCursor, startTime, endTime);
    res.status(200).send({
        success: true,
        message: "User sessions retrieved",
        metadata,
        data
    });
    logger.info(`Sent sessions for user with ID ${userId} successfully`);
    return;
})

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

router.get('/api/v2/user/:userId/ongoing-session', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const ongoingSessions = await getOngoingSessionV2(userId);
        res.status(200).send({success: true, message: "Ongoing sessions retrieved", data: ongoingSessions});
        logger.info(`Sent ongoing session for User ID ${userId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/sessions/:sessionId/invoice-details', authenticate, async (req: Request, res: Response) => {
    try {
        const {sessionId} = req.params;
        const invoiceDetails = await getSessionInvoiceDetails(Number(sessionId));
        res.status(200).send({success: true, message: "Session details retrieved", data: invoiceDetails});
        logger.info(`Sent session with ID ${sessionId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

export {
    router
}