import {Router, Request, Response} from 'express';
import {getSession, listAllUserSessions} from '../controllers/sessionController';
import {authenticate, authorize} from "../middleware/auth.middleware";
import {logger} from "../app";


const router : Router = Router();

router.get('/api/sessions/:sessionId', authenticate, async (req: Request, res: Response) => {
    try {
        const { sessionId } = req.params;
        const session = await getSession(Number(sessionId));
        res.status(200).send({ success: true, message: "Session details retrieved", data: session });
    } catch (error: any) {
        logger.error([]);
        res.status(500).send({ error: error.message });
    }
});

router.get('/api/sessions/:userId'), authenticate, async (req: Request, res: Response) => {
    try {
        const { userId } = req.params;
        const sessions = await listAllUserSessions(Number(userId));
        res.status(200).send({ success: true, message: "User sessions retrieved", data: sessions });
    } catch (error: any) {
        res.status(500).send({ error: error.message });
    }
}

export {
    router
}