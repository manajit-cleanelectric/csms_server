export function toAmountString(n: number | string): string {
    const v = typeof n === 'string' ? Number(n) : n;
    if (!Number.isFinite(v) || v < 0) throw new Error('Amount must be a positive number');
    return v.toFixed(4);
}

// Helper function for date parsing
export function parseDate(dateString: string | undefined, fallback: Date): Date {
    if (!dateString) return fallback;

    const parsed = new Date(dateString);
    return isNaN(parsed.getTime()) ? fallback : parsed;
}