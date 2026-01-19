export function toTitleCase(str: any): string {
    if (!str) {
        return "";
    }
    if (typeof str !== 'string') {
        str = String(str);
    }
    return str
        .trim()
        .replace(/\s+/g, ' ')
        .split(' ')
        .map((word: string) =>
            word.length > 0 ? word[0].toUpperCase() + word.slice(1).toLowerCase() : ''
        )
        .join(' ')
}

export function trimBIN(bin: string): string {
    const startIndex = 7;
    const endCount = 4;
    if (bin.length > startIndex + endCount) {
        bin = bin.slice(0, startIndex) + bin.slice(-endCount);
    }
    return bin.toUpperCase().trim();
}