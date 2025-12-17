/**
 * Text normalization utilities for Arabic and English text
 */

/**
 * Normalize Arabic text by removing diacritics and normalizing forms
 */
export function normalizeArabic(text: string): string {
    let normalized = text;

    // Remove Arabic diacritics (tashkeel)
    normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');

    // Normalize Alef variations to standard Alef
    normalized = normalized.replace(/[\u0622\u0623\u0625]/g, '\u0627'); // أ إ آ -> ا

    // Normalize Teh Marbuta to Heh
    normalized = normalized.replace(/\u0629/g, '\u0647'); // ة -> ه

    // Normalize Yeh variations
    normalized = normalized.replace(/[\u0649\u064A]/g, '\u064A'); // ى ي -> ي

    return normalized;
}

/**
 * Normalize English text
 */
export function normalizeEnglish(text: string): string {
    let normalized = text;

    // Leet speak conversion disabled by default as it's too aggressive
    // Users can implement custom normalization if needed
    // const leetMap: { [key: string]: string } = {
    //   '0': 'o',
    //   '1': 'i',
    //   '3': 'e',
    //   '4': 'a',
    //   '5': 's',
    //   '7': 't',
    //   '8': 'b',
    //   '@': 'a',
    //   '$': 's',
    // };

    // // Apply leet speak conversion (only for known patterns)
    // for (const [leet, normal] of Object.entries(leetMap)) {
    //   const regex = new RegExp(leet, 'gi');
    //   normalized = normalized.replace(regex, normal);
    // }

    return normalized;
}

/**
 * Normalize text for both Arabic and English
 */
export function normalizeText(text: string, options: {
    arabic?: boolean;
    english?: boolean;
    lowercase?: boolean;
} = {}): string {
    const { arabic = true, english = true, lowercase = true } = options;

    let normalized = text;

    // Unicode normalization (NFC form)
    normalized = normalized.normalize('NFC');

    // Apply Arabic normalization
    if (arabic) {
        normalized = normalizeArabic(normalized);
    }

    // Apply English normalization
    if (english) {
        normalized = normalizeEnglish(normalized);
    }

    // Convert to lowercase
    if (lowercase) {
        normalized = normalized.toLowerCase();
    }

    // Normalize whitespace
    normalized = normalized.replace(/\s+/g, ' ').trim();

    return normalized;
}

/**
 * Remove extra spaces and normalize whitespace
 */
export function normalizeWhitespace(text: string): string {
    return text.replace(/\s+/g, ' ').trim();
}

/**
 * Detect if text contains Arabic characters
 */
export function hasArabic(text: string): boolean {
    return /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/.test(text);
}

/**
 * Detect if text contains English characters
 */
export function hasEnglish(text: string): boolean {
    return /[a-zA-Z]/.test(text);
}
