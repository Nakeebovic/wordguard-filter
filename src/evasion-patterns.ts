/**
 * Evasion pattern definitions for detecting common tricks users employ
 * to bypass sensitive word filters
 */

/**
 * Character substitution map - common replacements used in leet speak and evasion
 */
export const CHARACTER_SUBSTITUTIONS: { [key: string]: string[] } = {
    'a': ['@', '4', 'α', 'а', 'ā', 'á', 'à', 'â', 'ä', 'ã', 'å', 'ａ', 'Ａ', 'ⓐ', '🅐', '🅰'],
    'b': ['8', 'ß', 'в', 'ḃ', '6', 'ｂ', 'Ｂ', 'ⓑ', '🅑', '🅱'],
    'c': ['ç', 'ć', 'č', 'ĉ', 'ｃ', 'Ｃ', 'ⓒ', '🅒', '©'],
    'd': ['đ', 'ď', 'ｄ', 'Ｄ', 'ⓓ', '🅓'],
    'e': ['3', '€', 'е', 'ē', 'é', 'è', 'ê', 'ë', 'ė', 'ę', 'ｅ', 'Ｅ', 'ⓔ', '🅔'],
    'f': ['ƒ', 'ph', 'ｆ', 'Ｆ', 'ⓕ', '🅕'],
    'g': ['9', '6', 'ğ', 'ģ', 'ġ', 'ｇ', 'Ｇ', 'ⓖ', '🅖'],
    'h': ['#', 'ħ', 'ĥ', 'ｈ', 'Ｈ', 'ⓗ', '🅗'],
    'i': ['1', '!', 'í', 'ì', 'î', 'ï', 'ī', 'į', 'ı', 'ｉ', 'Ｉ', 'ⓘ', '🅘', '|', 'l'],
    'j': ['ĵ', 'ｊ', 'Ｊ', 'ⓙ', '🅙'],
    'k': ['ķ', 'ｋ', 'Ｋ', 'ⓚ', '🅚'],
    'l': ['1', 'ł', 'ĺ', 'ļ', 'ľ', 'ｌ', 'Ｌ', 'ⓛ', '🅛', '|', 'I'],
    'm': ['м', 'ｍ', 'Ｍ', 'ⓜ', '🅜'],
    'n': ['ñ', 'ń', 'ň', 'ņ', 'ｎ', 'Ｎ', 'ⓝ', '🅝'],
    'o': ['0', 'ο', 'о', 'ō', 'ó', 'ò', 'ô', 'ö', 'õ', 'ø', 'ｏ', 'Ｏ', 'ⓞ', '🅞', '○', '◯'],
    'p': ['р', 'þ', 'ｐ', 'Ｐ', 'ⓟ', '🅟'],
    'q': ['9', 'ｑ', 'Ｑ', 'ⓠ', '🅠'],
    'r': ['я', 'ŕ', 'ř', 'ŗ', 'ｒ', 'Ｒ', 'ⓡ', '🅡', '®'],
    's': ['$', '5', 'ś', 'š', 'ş', 'ș', 'ŝ', 'ｓ', 'Ｓ', 'ⓢ', '🅢'],
    't': ['7', '†', 'ţ', 'ť', 'ț', 'ｔ', 'Ｔ', 'ⓣ', '🅣', '+'],
    'u': ['υ', 'ū', 'ú', 'ù', 'û', 'ü', 'ů', 'ų', 'ｕ', 'Ｕ', 'ⓤ', '🅤', 'µ'],
    'v': ['ν', 'ｖ', 'Ｖ', 'ⓥ', '🅥'],
    'w': ['vv', 'ω', 'ŵ', 'ｗ', 'Ｗ', 'ⓦ', '🅦'],
    'x': ['×', 'ｘ', 'Ｘ', 'ⓧ', '🅧', '✕', '✖'],
    'y': ['ý', 'ÿ', 'ŷ', 'ｙ', 'Ｙ', 'ⓨ', '🅨'],
    'z': ['2', 'ź', 'ž', 'ż', 'ｚ', 'Ｚ', 'ⓩ', '🅩']
};

/**
 * Arabic letter substitutions - similar looking characters and common evasion tricks
 */
export const ARABIC_SUBSTITUTIONS: { [key: string]: string[] } = {
    // Alef variations
    'ا': ['أ', 'إ', 'آ', 'ٱ', 'ٲ', 'ٳ', 'ٵ', 'ﺍ', 'ﺎ', '1', '|', 'l', 'I', 'ﺃ', 'ﺄ', 'ﺇ', 'ﺈ'],
    // Beh variations
    'ب': ['ٮ', 'پ', 'ڀ', 'ﺏ', 'ﺐ', 'ﺑ', 'ﺒ'],
    // Teh variations
    'ت': ['ٺ', 'ټ', 'ﺕ', 'ﺖ', 'ﺗ', 'ﺘ'],
    // Theh variations
    'ث': ['ٽ', 'ﺙ', 'ﺚ', 'ﺛ', 'ﺜ'],
    // Jeem variations
    'ج': ['چ', 'ڃ', 'ڄ', 'ﺝ', 'ﺞ', 'ﺟ', 'ﺠ'],
    // Hah variations
    'ح': ['ځ', 'ڂ', 'ﺡ', 'ﺢ', 'ﺣ', 'ﺤ'],
    // Khah variations
    'خ': ['ڦ', 'ﺥ', 'ﺦ', 'ﺧ', 'ﺨ'],
    // Dal variations
    'د': ['ڈ', 'ډ', 'ڊ', 'ﺩ', 'ﺪ'],
    // Thal variations
    'ذ': ['ڌ', 'ﺫ', 'ﺬ'],
    // Reh variations
    'ر': ['ڑ', 'ړ', 'ڕ', 'ﺭ', 'ﺮ'],
    // Zain variations
    'ز': ['ڒ', 'ژ', 'ﺯ', 'ﺰ'],
    // Seen variations
    'س': ['ښ', 'ڛ', 'ﺱ', 'ﺲ', 'ﺳ', 'ﺴ'],
    // Sheen variations
    'ش': ['ڜ', 'ﺵ', 'ﺶ', 'ﺷ', 'ﺸ'],
    // Sad variations
    'ص': ['ڝ', 'ﺹ', 'ﺺ', 'ﺻ', 'ﺼ'],
    // Dad variations
    'ض': ['ڞ', 'ﺽ', 'ﺾ', 'ﺿ', 'ﻀ'],
    // Tah variations
    'ط': ['ﻁ', 'ﻂ', 'ﻃ', 'ﻄ'],
    // Zah variations
    'ظ': ['ﻅ', 'ﻆ', 'ﻇ', 'ﻈ'],
    // Ain variations
    'ع': ['ﻉ', 'ﻊ', 'ﻋ', 'ﻌ', '3'],
    // Ghain variations
    'غ': ['ﻍ', 'ﻎ', 'ﻏ', 'ﻐ'],
    // Feh variations
    'ف': ['ڡ', 'ڢ', 'ڣ', 'ﻑ', 'ﻒ', 'ﻓ', 'ﻔ'],
    // Qaf variations
    'ق': ['ڤ', 'ڥ', 'ﻕ', 'ﻖ', 'ﻗ', 'ﻘ'],
    // Kaf variations
    'ك': ['ک', 'ڪ', 'ﻙ', 'ﻚ', 'ﻛ', 'ﻜ', 'گ'],
    // Lam variations
    'ل': ['ڵ', 'ﻝ', 'ﻞ', 'ﻟ', 'ﻠ'],
    // Meem variations
    'م': ['ﻡ', 'ﻢ', 'ﻣ', 'ﻤ'],
    // Noon variations
    'ن': ['ں', 'ڻ', 'ﻥ', 'ﻦ', 'ﻧ', 'ﻨ'],
    // Heh variations
    'ه': ['ھ', 'ہ', 'ە', 'ﻩ', 'ﻪ', 'ﻫ', 'ﻬ', 'ة', 'ۃ'],
    // Waw variations
    'و': ['ۆ', 'ۇ', 'ۈ', 'ۉ', 'ﻭ', 'ﻮ', '0', 'o', 'O'],
    // Yeh variations
    'ي': ['ی', 'ۍ', 'ې', 'ے', 'ﻱ', 'ﻲ', 'ﻳ', 'ﻴ', 'ى', 'ئ'],
    // Teh marbuta
    'ة': ['ه', 'ھ', 'ہ', 'ۃ', 'ﺓ', 'ﺔ'],
    // Hamza
    'ء': ['ؤ', 'ئ', 'أ', 'إ']
};

/**
 * Zero-width and invisible characters that should be removed
 */
export const INVISIBLE_CHARACTERS = [
    '\u200B', // Zero-width space
    '\u200C', // Zero-width non-joiner
    '\u200D', // Zero-width joiner
    '\u200E', // Left-to-right mark
    '\u200F', // Right-to-left mark
    '\u2060', // Word joiner
    '\u2061', // Function application
    '\u2062', // Invisible times
    '\u2063', // Invisible separator
    '\u2064', // Invisible plus
    '\uFEFF', // Zero-width no-break space (BOM)
    '\u00AD', // Soft hyphen
    '\u034F', // Combining grapheme joiner
    '\u061C', // Arabic letter mark
    '\u115F', // Hangul choseong filler
    '\u1160', // Hangul jungseong filler
    '\u17B4', // Khmer vowel inherent aq
    '\u17B5', // Khmer vowel inherent aa
    '\u180E', // Mongolian vowel separator
    '\u3164', // Hangul filler
    '\uFFA0', // Halfwidth hangul filler
];

/**
 * Arabic Tatweel (kashida) - used to stretch words
 */
export const ARABIC_TATWEEL = '\u0640'; // ـ

/**
 * Reverse map for quick lookup (English)
 */
export const REVERSE_SUBSTITUTIONS: { [key: string]: string } = {};
for (const [letter, substitutes] of Object.entries(CHARACTER_SUBSTITUTIONS)) {
    for (const substitute of substitutes) {
        REVERSE_SUBSTITUTIONS[substitute.toLowerCase()] = letter;
    }
}

/**
 * Reverse map for Arabic substitutions
 */
export const REVERSE_ARABIC_SUBSTITUTIONS: { [key: string]: string } = {};
for (const [letter, substitutes] of Object.entries(ARABIC_SUBSTITUTIONS)) {
    for (const substitute of substitutes) {
        REVERSE_ARABIC_SUBSTITUTIONS[substitute] = letter;
    }
}

/**
 * Arabic to English character lookalikes
 */
export const ARABIC_ENGLISH_LOOKALIKES: { [key: string]: string } = {
    'ا': 'a',
    'ب': 'b',
    'ت': 't',
    'ث': 'th',
    'ج': 'j',
    'ح': 'h',
    'خ': 'kh',
    'د': 'd',
    'ذ': 'th',
    'ر': 'r',
    'ز': 'z',
    'س': 's',
    'ش': 'sh',
    'ص': 's',
    'ض': 'd',
    'ط': 't',
    'ظ': 'z',
    'ع': 'a',
    'غ': 'gh',
    'ف': 'f',
    'ق': 'q',
    'ك': 'k',
    'ل': 'l',
    'م': 'm',
    'ن': 'n',
    'ه': 'h',
    'و': 'w',
    'ي': 'y'
};

/**
 * Common symbol patterns used to obfuscate words
 */
export const SYMBOL_PATTERNS = [
    { pattern: /[*_\-~]/g, replacement: '' },           // Remove decorative symbols
    { pattern: /[@]/g, replacement: 'a' },              // @ -> a
    { pattern: /[$]/g, replacement: 's' },              // $ -> s
    { pattern: /[!]/g, replacement: 'i' },              // ! -> i
    { pattern: /[0]/g, replacement: 'o' },              // 0 -> o
    { pattern: /[1]/g, replacement: 'i' },              // 1 -> i
    { pattern: /[3]/g, replacement: 'e' },              // 3 -> e
    { pattern: /[4]/g, replacement: 'a' },              // 4 -> a
    { pattern: /[5]/g, replacement: 's' },              // 5 -> s
    { pattern: /[7]/g, replacement: 't' },              // 7 -> t
    { pattern: /[8]/g, replacement: 'b' },              // 8 -> b
    { pattern: /[9]/g, replacement: 'g' },              // 9 -> g
];

/**
 * Patterns for detecting space insertion
 */
export const SPACE_PATTERNS = [
    /\s+/g,           // Multiple spaces
    /[._\-|]/g,       // Separators used as spaces
];

/**
 * Maximum repeated character threshold
 */
export const MAX_REPEATED_CHARS = 2;

/**
 * Common phonetic variations
 */
export const PHONETIC_VARIATIONS: { [key: string]: string[] } = {
    'f': ['ph', 'ff'],
    'k': ['c', 'ck', 'q'],
    's': ['c', 'z', 'ss'],
    'z': ['s'],
    'sh': ['ch'],
    'ks': ['x'],
};

/**
 * Normalize text by applying all evasion pattern removals
 */
export function normalizeForEvasion(text: string, options: {
    removeSymbols?: boolean;
    removeSpaces?: boolean;
    normalizeRepeated?: boolean;
    substituteCharacters?: boolean;
    handleLanguageMixing?: boolean;
    removeInvisible?: boolean;
    removeTatweel?: boolean;
    normalizeArabic?: boolean;
} = {}): string {
    const {
        removeSymbols = true,
        removeSpaces = true,
        normalizeRepeated = true,
        substituteCharacters = true,
        handleLanguageMixing = true,
        removeInvisible = true,
        removeTatweel = true,
        normalizeArabic = true
    } = options;

    let normalized = text.toLowerCase();

    // Remove invisible characters FIRST (very important!)
    if (removeInvisible) {
        for (const char of INVISIBLE_CHARACTERS) {
            normalized = normalized.split(char).join('');
        }
    }

    // Remove Arabic Tatweel (kashida stretching)
    if (removeTatweel) {
        normalized = normalized.replace(new RegExp(ARABIC_TATWEEL, 'g'), '');
    }

    // Normalize Arabic character variations
    if (normalizeArabic) {
        for (const [original, substitutes] of Object.entries(ARABIC_SUBSTITUTIONS)) {
            for (const substitute of substitutes) {
                normalized = normalized.split(substitute).join(original);
            }
        }
        // Also remove Arabic diacritics (tashkeel)
        normalized = normalized.replace(/[\u064B-\u065F\u0670]/g, '');
    }

    // Handle language mixing (Arabic to English)
    // Only apply if text contains English characters to avoid false positives
    // converting pure Arabic to English (e.g. "انا احمد" -> "ana ahmad" matching "anal")
    const hasEnglish = /[a-z]/i.test(normalized);
    if (handleLanguageMixing && hasEnglish) {
        for (const [arabic, english] of Object.entries(ARABIC_ENGLISH_LOOKALIKES)) {
            normalized = normalized.replace(new RegExp(arabic, 'g'), english);
        }
    }

    // Substitute characters (leet speak, symbols)
    if (substituteCharacters) {
        for (const [original, substitutes] of Object.entries(CHARACTER_SUBSTITUTIONS)) {
            for (const substitute of substitutes) {
                // Use split/join instead of regex to handle special characters
                normalized = normalized.split(substitute.toLowerCase()).join(original);
            }
        }
    }

    // Remove symbols
    if (removeSymbols) {
        for (const { pattern, replacement } of SYMBOL_PATTERNS) {
            normalized = normalized.replace(pattern, replacement);
        }
    }

    // Remove spaces and separators
    if (removeSpaces) {
        for (const pattern of SPACE_PATTERNS) {
            normalized = normalized.replace(pattern, '');
        }
    }

    // Normalize repeated characters (e.g., "shiiiiit" -> "shiit")
    if (normalizeRepeated) {
        normalized = normalized.replace(/(.)\1{2,}/g, (_match, char) => {
            return char.repeat(MAX_REPEATED_CHARS);
        });
    }

    return normalized;
}

/**
 * Aggressive normalization for paranoid mode - removes EVERYTHING suspicious
 */
export function normalizeParanoid(text: string): string {
    let normalized = normalizeForEvasion(text, {
        removeSymbols: true,
        removeSpaces: true,
        normalizeRepeated: true,
        substituteCharacters: true,
        handleLanguageMixing: true,
        removeInvisible: true,
        removeTatweel: true,
        normalizeArabic: true
    });

    // Additional paranoid normalization
    // Remove ALL non-alphanumeric characters except Arabic letters
    normalized = normalized.replace(/[^\p{L}\p{N}]/gu, '');

    // Collapse ALL repeated characters to single
    normalized = normalized.replace(/(.)\1+/g, '$1');

    return normalized;
}

/**
 * Generate all possible evasion variants of a word
 */
export function generateEvasionVariants(word: string): string[] {
    const variants = new Set<string>();
    variants.add(word.toLowerCase());

    // Add normalized version
    variants.add(normalizeForEvasion(word));

    // Add version with spaces removed
    variants.add(word.replace(/\s+/g, ''));

    // Add version with common substitutions
    let withSubstitutions = word.toLowerCase();
    for (const [original, substitutes] of Object.entries(CHARACTER_SUBSTITUTIONS)) {
        for (const substitute of substitutes) {
            withSubstitutions = withSubstitutions.replace(new RegExp(substitute, 'gi'), original);
        }
    }
    variants.add(withSubstitutions);

    return Array.from(variants);
}

/**
 * Detect which evasion technique was used
 */
export function detectEvasionTechnique(original: string, _normalized: string): string[] {
    const techniques: string[] = [];

    // Check for symbol replacement
    if (/[@$!*#]/.test(original)) {
        techniques.push('symbol_replacement');
    }

    // Check for space insertion
    if (/\s{2,}/.test(original) || /[._\-|]/.test(original)) {
        techniques.push('space_insertion');
    }

    // Check for repeated letters
    if (/(.)\1{3,}/.test(original)) {
        techniques.push('repeated_letters');
    }

    // Check for number substitution (leet speak)
    if (/[0-9]/.test(original)) {
        techniques.push('leet_speak');
    }

    // Check for language mixing
    if (/[\u0600-\u06FF]/.test(original) && /[a-zA-Z]/.test(original)) {
        techniques.push('language_mixing');
    }

    // Check for character substitution
    const hasSubstitution = Object.values(CHARACTER_SUBSTITUTIONS)
        .flat()
        .some(sub => original.toLowerCase().includes(sub.toLowerCase()));
    if (hasSubstitution) {
        techniques.push('character_substitution');
    }

    return techniques;
}
