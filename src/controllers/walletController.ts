import {MissingParameterError} from "../errors/customErrors";
import {Wallet} from "../models/wallets";

async function getUserWallet(userId: string) {
    if (!userId) {
        throw new MissingParameterError("Missing required user information");
    }
    return await Wallet.findOne({
        where: {
            user: {id: userId},
        },
    });
}


export {
    getUserWallet,
}