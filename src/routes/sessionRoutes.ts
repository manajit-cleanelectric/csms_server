import {Request, Response, Router} from 'express';
import {
    getOngoingSession,
    getSession,
    listAllChargerSessions,
    listAllUserSessions,
    sendRemoteStopTransaction
} from '../controllers/sessionController';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger} from "../app";
import {UserRoles} from "../models/users";
import {handleError} from "../errors/customErrors";


const router: Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const {sessionId} = req.params;
        const session = await getSession(Number(sessionId));
        res.status(200).send({success: true, message: "Session details retrieved", data: [session]});
        logger.info(`Sent session with ID ${sessionId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/user/:userId/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const sessions = await listAllUserSessions(userId);
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
                message: "Transaction Stop Request could not be send Sent.",
                data: null
            });
        }
        res.status(200).send({success: true, message: "Transaction Stop Request Sent", data: null});
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

router.get('/api/user/:userId/ongoing-sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const sessions = await getOngoingSession(userId);
        res.status(200).send({success: true, message: "Ongoing sessions retrieved", data: [sessions]});
        logger.info(`Sent ongoing session for User ID ${userId} successfully`);
    } catch (error: any) {
        handleError(error, res, logger);
    }
});

export {
    router
}