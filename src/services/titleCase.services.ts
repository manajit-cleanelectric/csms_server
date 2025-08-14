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
