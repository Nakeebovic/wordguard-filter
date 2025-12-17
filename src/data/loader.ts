import { SensitiveWord } from '../types';
import englishData from './english.json';
import arabicData from './arabic.json';

/**
 * Load word database from JSON files
 */
export function loadWordDatabase(): SensitiveWord[] {
    const words: SensitiveWord[] = [];

    // Load English words
    for (const [category, wordList] of Object.entries(englishData)) {
        for (const item of wordList) {
            words.push({
                word: item.word,
                severity: item.severity,
                category,
                language: 'en'
            });

            // Add variations
            if (item.variations && item.variations.length > 0) {
                for (const variation of item.variations) {
                    words.push({
                        word: variation,
                        severity: item.severity,
                        category,
                        language: 'en'
                    });
                }
            }
        }
    }

    // Load Arabic words
    for (const [category, wordList] of Object.entries(arabicData)) {
        for (const item of wordList) {
            words.push({
                word: item.word,
                severity: item.severity,
                category,
                language: 'ar'
            });

            // Add variations
            if (item.variations && item.variations.length > 0) {
                for (const variation of item.variations) {
                    words.push({
                        word: variation,
                        severity: item.severity,
                        category,
                        language: 'ar'
                    });
                }
            }
        }
    }

    return words;
}

/**
 * Get words filtered by options
 */
export function getFilteredWords(
    allWords: SensitiveWord[],
    options: {
        minSeverity?: number;
        maxSeverity?: number;
        languages?: ('en' | 'ar')[];
        categories?: string[];
    } = {}
): SensitiveWord[] {
    const {
        minSeverity = 1,
        maxSeverity = 4,
        languages = ['en', 'ar'],
        categories
    } = options;

    return allWords.filter(word => {
        // Check severity
        if (word.severity < minSeverity || word.severity > maxSeverity) {
            return false;
        }

        // Check language
        if (word.language && !languages.includes(word.language)) {
            return false;
        }

        // Check category
        if (categories && categories.length > 0) {
            if (!word.category || !categories.includes(word.category)) {
                return false;
            }
        }

        return true;
    });
}

/**
 * Validate a custom word
 */
export function validateWord(word: SensitiveWord): boolean {
    if (!word.word || typeof word.word !== 'string' || word.word.trim().length === 0) {
        return false;
    }

    if (typeof word.severity !== 'number' || word.severity < 1 || word.severity > 4) {
        return false;
    }

    if (word.language && !['en', 'ar'].includes(word.language)) {
        return false;
    }

    return true;
}
