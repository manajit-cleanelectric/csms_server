import { AppDataSource } from '../database/datasource';
import { EntryType, TxnCategory } from '../models/enums';
import { LedgerEntry } from '../models/LedgerEntry.model';
import { Transaction } from '../models/transaction.model';
import { Wallet } from '../models/wallet.model';
import { toAmountString } from '../utils/money';

type Leg = { wallet: Wallet; type: EntryType; amount: string; memo?: string | null };

export class LedgerService {
    static async postBalancedTransaction(params: {
        externalRef: string;
        category: TxnCategory;
        description?: string;
        legs: Leg[]; // must balance
    }) {
        const ds = AppDataSource;
        return ds.transaction('READ COMMITTED', async (manager) => {
            // Enforce idempotency by externalRef
            const existing = await manager.findOne(Transaction, { where: { externalRef: params.externalRef } });
            if (existing) return existing;

            // Validate amounts & balance
            let debit = 0, credit = 0;
            for (const l of params.legs) {
                const amt = Number(l.amount);
                if (amt <= 0) throw new Error('Ledger amounts must be positive');
                if (l.type === EntryType.DEBIT) debit += amt; else credit += amt;
            }
            if (Math.abs(debit - credit) > 1e-6) {
                throw new Error('Transaction not balanced (debits != credits)');
            }

            // Pessimistic lock wallets to avoid race conditions on balance updates
            const walletsToLock = [...new Set(params.legs.map(l => l.wallet.id))];
            const lockedWallets = await Promise.all(walletsToLock.map(id =>
                manager.findOne(Wallet, { where: { id }, lock: { mode: 'pessimistic_write' } })
            ));
            if (lockedWallets.some(w => !w)) throw new Error('Wallet lock failed');

            // Create transaction
            const txn = manager.create(Transaction, {
                externalRef: params.externalRef,
                category: params.category,
                description: params.description ?? null
            });
            await manager.save(txn);

            // Create legs
            const entries = params.legs.map(l => manager.create(LedgerEntry, {
                transaction: txn,
                wallet: l.wallet,
                type: l.type,
                amount: toAmountString(l.amount),
                memo: l.memo ?? null
            }));
            await manager.save(entries);

            // Update running balances (materialized balance)
            for (const l of params.legs) {
                const w = lockedWallets.find(x => x!.id === l.wallet.id)!;
                const curr = Number(w!.balance);
                const amt = Number(l.amount);
                const newBal =
                    l.type === EntryType.CREDIT ? (curr + amt) : (curr - amt);
                w!.balance = newBal.toFixed(4);
                await manager.save(Wallet, w!);
            }

            return txn;
        });
    }
}
