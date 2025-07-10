import {Request, Response, Router} from 'express';
import {getSession, listAllUserSessions, sendRemoteStopTransaction} from '../controllers/sessionController';
import {authenticate} from "../middleware/auth.middleware";
import {logger} from "../app";


const router: Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const {sessionId} = req.params;
        const session = await getSession(sessionId);
        res.status(200).send({success: true, message: "Session details retrieved", data: session});
    } catch (error: any) {
        logger.error(`Error retrieving session ${req.params.sessionId}: ${error.message}`);
        res.status(500).send({error: error.message});
    }
});

router.get('/api/user/:userId/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const {userId} = req.params;
        const sessions = await listAllUserSessions(userId);
        res.status(200).send({success: true, message: "User sessions retrieved", data: sessions});
    } catch (error: any) {
        res.status(500).send({error: error.message});
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
        res.status(500).send({error: error.message});
    }
});

export {
    router
}