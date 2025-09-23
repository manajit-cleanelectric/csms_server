import { createHmac } from 'crypto';

const RADIX = BigInt(36);               // 0-9A-Z
const LEN = 10;                         // length 10 digits
const N = RADIX ** BigInt(LEN);         // domain size = 36^10

// Split 10 digits as 5|5 for balanced Feistel (equal halves for better randomization)
const L_LEN = 5;
const R_LEN = LEN - L_LEN; // 5
const MOD_L = RADIX ** BigInt(L_LEN); // 36^5
const MOD_R = RADIX ** BigInt(R_LEN); // 36^5

const ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ' as const;

function toBase36Fixed(n: bigint, length = LEN): string {
    if (n < BigInt(0) || n >= N) throw new RangeError(`Out of domain 0..36^${LEN}-1`);
    if (n === BigInt(0)) return '0'.repeat(length);
    let s = '';
    const base = BigInt(36);
    let x = n;
    while (x > BigInt(0)) {
        const rem = Number(x % base);
        s = ALPHABET[rem] + s;
        x /= base;
    }
    return s.padStart(length, '0');
}

function fromBase36Fixed(s: string): bigint {
    if (!/^[0-9A-Z]{10}$/.test(s)) throw new RangeError('Expected 10 chars [0-9A-Z]');
    let n = BigInt(0);
    for (const ch of s) {
        const v = ALPHABET.indexOf(ch);
        n = n * BigInt(36) + BigInt(v);
    }
    return n;
}

// Encode bigint to fixed-length big-endian bytes
function bigIntToBE(x: bigint, bytes: number): Buffer {
    const out = Buffer.alloc(bytes);
    let v = x;
    for (let i = bytes - 1; i >= 0; i--) {
        out[i] = Number(v & BigInt(0xff));
        v >>= BigInt(8);
    }
    return out;
}

// Round function for deterministic but non-sequential mapping
function F(key: Buffer, side: bigint, round: number, mod: bigint, sideBytes = 8): bigint {
    const h = createHmac('sha256', key);
    // Fixed salt ensures same input always produces same output
    h.update(Buffer.from('feistel_round_', 'utf8'));
    h.update(Buffer.from([round & 0xff])); // single byte round counter
    h.update(bigIntToBE(side, sideBytes));

    const digest = h.digest();
    let acc = BigInt(0);

    // Use full 32-byte digest for better mixing
    for (let i = 0; i < digest.length; i += 8) {
        const chunk = digest.subarray(i, i + 8);
        let val = BigInt(0);
        for (let j = 0; j < chunk.length; j++) {
            val = (val << BigInt(8)) | BigInt(chunk[j]);
        }
        acc ^= val; // XOR for better mixing
    }

    return acc % mod;
}

// Enhanced Feistel permutation with more rounds for better randomization
function feistelPermute(x: bigint, key: Buffer, rounds = 12): bigint {
    if (x < BigInt(0) || x >= N) throw new RangeError(`Out of domain 0..36^${LEN}-1`);

    // Split into L and R (both 4 digits for balanced Feistel)
    let L = x % MOD_L;
    let R = x / MOD_L;

    for (let i = 0; i < rounds; i++) {
        // Alternate which side gets updated for better mixing
        const newR = (L + F(key, R, i, MOD_L)) % MOD_L;
        L = R;
        R = newR;
    }

    return R * MOD_L + L;
}

function feistelInvert(y: bigint, key: Buffer, rounds = 12): bigint {
    if (y < BigInt(0) || y >= N) throw new RangeError(`Out of domain 0..36^${LEN}-1`);

    // Split y the same way as in permute: R * MOD_L + L
    let R = y / MOD_L;  // Extract R (left 5 digits)
    let L = y % MOD_L;  // Extract L (right 5 digits)

    // Reverse the rounds - undo each step in reverse order
    for (let i = rounds - 1; i >= 0; i--) {
        // Undo: newR = (L + F(key, R, i, MOD_L)) % MOD_L; L = R; R = newR;
        // So: L was R, and R was (L - F(key, L, i, MOD_L)) % MOD_L
        const oldR = L;
        const oldL = (R - F(key, oldR, i, MOD_L) + MOD_L) % MOD_L;
        L = oldL;
        R = oldR;
    }

    // Reconstruct: original was L + R * MOD_L (same as permute input format)
    return L + R * MOD_L;
}

// Public API - deterministic one-to-one mapping

/**
 * Generates a randomized session ID from a numeric input using a Feistel network.
 * @param input A number or bigint in the range 0 <= n < 36^10
 * @param secretKey A secret key string used for HMAC in the Feistel rounds
 * @param rounds Number of Feistel rounds (default 12)
 * @returns A session ID string in the format 'session_XXXXXXXXXX' where X are base36 chars
 * @throws RangeError if input is out of range
 */
function makeSessionIdRandomized(input: number | bigint, secretKey: string, rounds = 12): string {
    const n = typeof input === 'bigint' ? input : BigInt(input);
    if (n < BigInt(0) || n >= N) throw new RangeError(`Input must be 0 <= n < 36^${LEN}`);

    // Use the secret key directly - no input-specific derivation
    // This ensures deterministic output for the same input
    const key = Buffer.from(secretKey, 'utf8');

    const perm = feistelPermute(n, key, rounds);
    const code = toBase36Fixed(perm);
    return `session_${code}`;
}

/**
 * Decodes a randomized session ID back to the original numeric input.
 * @param sessionId A session ID string in the format 'session_XXXXXXXXXX'
 * @param secretKey The same secret key string used for encoding
 * @param rounds Number of Feistel rounds (default 12)
 * @returns The original numeric input as a bigint
 * @throws RangeError if sessionId format is invalid or decoding fails
 */
function decodeSessionIdRandomized(sessionId: string, secretKey: string, rounds = 12): bigint {
    const m = sessionId.match(/^session_([0-9A-Z]{10})$/);
    if (!m) throw new RangeError('Invalid session id format');

    const perm = fromBase36Fixed(m[1]); // Fixed: was m[21]
    const key = Buffer.from(secretKey, 'utf8');
    return feistelInvert(perm, key, rounds);
}



export {
    makeSessionIdRandomized,
    decodeSessionIdRandomized,
};