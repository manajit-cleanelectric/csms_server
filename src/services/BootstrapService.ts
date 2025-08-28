import { AppDataSource } from '../database/datasource';
import { Wallet } from '../models/wallet.model';
import { WalletType } from '../models/enums';

export async function ensureSystemWallets() {
    const repo = AppDataSource.getRepository(Wallet);

    const defs = [
        { code: 'SYSTEM:RAZORPAY_SETTLEMENT', type: WalletType.SYSTEM },
        { code: 'SYSTEM:CPO_REVENUE', type: WalletType.SYSTEM }
    ];

    for (const d of defs) {
        let w = await repo.findOne({ where: { code: d.code } });
        if (!w) {
            w = repo.create({ code: d.code, type: d.type, user: null, currency: "INR", balance: '0.0000' });
            await repo.save(w);
        }
    }
}
