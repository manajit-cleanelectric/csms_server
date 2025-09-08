export function toAmountString(n: number | string): string {
    const v = typeof n === 'string' ? Number(n) : n;
    if (!Number.isFinite(v) || v < 0) throw new Error('Amount must be a positive number');
    return v.toFixed(4);
}
