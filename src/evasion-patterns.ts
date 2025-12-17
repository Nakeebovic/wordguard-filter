/**
 * Evasion pattern definitions for detecting common tricks users employ
 * to bypass sensitive word filters
 */

/**
 * Character substitution map - common replacements used in leet speak and evasion
 */
export const CHARACTER_SUBSTITUTIONS: { [key: string]: string[] } = {
    'a': ['@', '4', 'α', 'а', 'ā', 'á', 'à', 'â', 'ä', 'ã', 'å'],
    'b': ['8', 'ß', 'в', 'ḃ', '6'],
    'c': ['ç', 'ć', 'č', 'ĉ'],  // Removed special chars that break regex
    'd': ['đ', 'ď'],
    'e': ['3', '€', 'е', 'ē', 'é', 'è', 'ê', 'ë', 'ė', 'ę'],
    'f': ['ƒ', 'ph'],
    'g': ['9', '6', 'ğ', 'ģ', 'ġ'],
    'h': ['#', 'ħ', 'ĥ'],
    'i': ['1', '!', 'í', 'ì', 'î', 'ï', 'ī', 'į', 'ı'],
    'j': ['ĵ'],
    'k': ['ķ'],
    'l': ['1', 'ł', 'ĺ', 'ļ', 'ľ'],
    'm': ['м'],
    'n': ['ñ', 'ń', 'ň', 'ņ'],
    'o': ['0', 'ο', 'о', 'ō', 'ó', 'ò', 'ô', 'ö', 'õ', 'ø'],
    'p': ['р', 'þ'],
    'q': ['9'],
    'r': ['я', 'ŕ', 'ř', 'ŗ'],
    's': ['$', '5', 'ś', 'š', 'ş', 'ș', 'ŝ'],
    't': ['7', '†', 'ţ', 'ť', 'ț'],
    'u': ['υ', 'ū', 'ú', 'ù', 'û', 'ü', 'ů', 'ų'],
    'v': ['ν'],
    'w': ['vv', 'ω', 'ŵ'],
    'x': ['×'],
    'y': ['ý', 'ÿ', 'ŷ'],
    'z': ['2', 'ź', 'ž', 'ż']
};

/**
 * Reverse map for quick lookup
 */
export const REVERSE_SUBSTITUTIONS: { [key: string]: string } = {};
for (const [letter, substitutes] of Object.entries(CHARACTER_SUBSTITUTIONS)) {
    for (const substitute of substitutes) {
        REVERSE_SUBSTITUTIONS[substitute.toLowerCase()] = letter;
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
} = {}): string {
    const {
        removeSymbols = true,
        removeSpaces = true,
        normalizeRepeated = true,
        substituteCharacters = true,
        handleLanguageMixing = true
    } = options;

    let normalized = text.toLowerCase();

    // Handle language mixing (Arabic to English)
    if (handleLanguageMixing) {
        for (const [arabic, english] of Object.entries(ARABIC_ENGLISH_LOOKALIKES)) {
            normalized = normalized.replace(new RegExp(arabic, 'g'), english);
        }
    }

    // Substitute characters (leet speak, symbols)
    if (substituteCharacters) {
        for (const [original, substitutes] of Object.entries(CHARACTER_SUBSTITUTIONS)) {
            for (const substitute of substitutes) {
                normalized = normalized.replace(new RegExp(substitute, 'gi'), original);
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
