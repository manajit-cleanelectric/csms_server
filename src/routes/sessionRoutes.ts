import {Router, Request, Response} from 'express';
import {getSession, listAllUserSessions} from '../controllers/sessionController';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger} from "../app";
import {sendRemoteStopTransaction} from "../controllers/sessionController";


const router: Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const {sessionId} = req.params;
        const session = await getSession(Number(sessionId));
        res.status(200).send({success: true, message: "Session details retrieved", data: session});
    } catch (error: any) {
        logger.error(`Error retrieving session ${req.params.sessionId}: ${error.message}`);
        res.status(500).send({error: error.message});
    }
});

router.get('/api/sessions/:userId', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const sessions = await listAllUserSessions(Number(userId));
        res.status(200).send({success: true, message: "User sessions retrieved", data: sessions});
    } catch (error: any) {
        res.status(500).send({error: error.message});
    }
});

router.get('/api/users/:userId/session/remote-stop-transaction', authenticate, async (req: Request, res: Response) => {
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
        res.status(500).send({error: error.message});
    }
});

export {
    router
}