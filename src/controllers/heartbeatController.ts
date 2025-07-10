import {Heartbeats} from "../models/heartbeats";

async function addHeartbeat(data: any) {
    try {
        const heartbeat = new Heartbeats();
        heartbeat.chargerId = data.chargerId;
        heartbeat.timestamp = data.timestamp;
        await heartbeat.save();
        return heartbeat;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

async function getChargerHeartbeats(chargerId: string) {
    try {
        const heartbeats = await Heartbeats.find({ where: { chargerId } });
        if (!heartbeats || heartbeats.length === 0) {
            throw new Error("No heartbeats found for this charger");
        }
        return heartbeats;
    } catch (error: any) {
        throw new Error(error.message);
    }
}

export {
    addHeartbeat,
    getChargerHeartbeats
}