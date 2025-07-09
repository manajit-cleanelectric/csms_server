import {Request, Response, Router} from 'express';
import {getSession, listAllUserSessions} from '../controllers/sessionController';
import {authenticate} from "../middleware/auth.middleware";
import {logger} from "../app";


const router : Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = await getSession(Number(sessionId));
        res.status(200).send({ success: true, message: "Session details retrieved", data: session });
    } catch (error: any) {
        logger.error(`Error retrieving session ${req.params.sessionId}: ${error.message}`);
        res.status(500).send({ error: error.message });
    }
});

router.get('/api/user/:userId/sessions', authenticate, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sessions = await listAllUserSessions(Number(userId));
        res.status(200).send({ success: true, message: "User sessions retrieved", data: sessions });
    } catch (error: any) {
        res.status(500).send({ error: error.message });
    }
});

export {
    router
}