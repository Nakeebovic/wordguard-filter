import { normalizeForEvasion, normalizeParanoid, detectEvasionTechnique } from './evasion-patterns';

/**
 * Strictness levels for fuzzy matching
 */
export enum DetectionStrictness {
    LOW = 1,       // Only exact matches
    MEDIUM = 2,    // Basic evasion detection (symbols, spaces)
    HIGH = 3,      // Aggressive fuzzy matching (all techniques)
    PARANOID = 4   // Maximum detection - catches EVERYTHING
}

/**
 * Fuzzy matching options
 */
export interface FuzzyMatchOptions {
    strictness: DetectionStrictness;
    maxEditDistance: number;
    detectSymbolReplacement: boolean;
    detectSpaceInsertion: boolean;
    detectRepeatedLetters: boolean;
    detectLanguageMixing: boolean;
}

/**
 * Fuzzy match result
 */
export interface FuzzyMatchResult {
    matched: boolean;
    confidence: number;
    normalizedText: string;
    evasionTechniques: string[];
}

/**
 * Fuzzy matcher for detecting evasion attempts
 */
export class FuzzyMatcher {
    private options: FuzzyMatchOptions;

    constructor(options: Partial<FuzzyMatchOptions> = {}) {
        this.options = {
            strictness: options.strictness ?? DetectionStrictness.MEDIUM,
            maxEditDistance: options.maxEditDistance ?? 2,
            detectSymbolReplacement: options.detectSymbolReplacement ?? true,
            detectSpaceInsertion: options.detectSpaceInsertion ?? true,
            detectRepeatedLetters: options.detectRepeatedLetters ?? true,
            detectLanguageMixing: options.detectLanguageMixing ?? true
        };
    }

    /**
     * Check if text matches word using fuzzy matching
     */
    fuzzyMatch(text: string, word: string): FuzzyMatchResult {
        const originalText = text;
        const normalizedWord = word.toLowerCase();

        // LOW strictness - exact match only
        if (this.options.strictness === DetectionStrictness.LOW) {
            const matched = text.toLowerCase() === normalizedWord;
            return {
                matched,
                confidence: matched ? 1.0 : 0.0,
                normalizedText: text.toLowerCase(),
                evasionTechniques: []
            };
        }

        // PARANOID mode - use maximum normalization
        if (this.options.strictness === DetectionStrictness.PARANOID) {
            const paranoidText = normalizeParanoid(text);
            const paranoidWord = normalizeParanoid(word);

            // Check for exact match after paranoid normalization
            if (paranoidText === paranoidWord) {
                const techniques = detectEvasionTechnique(originalText, paranoidText);
                return {
                    matched: true,
                    confidence: 0.99,
                    normalizedText: paranoidText,
                    evasionTechniques: techniques
                };
            }

            // Check if paranoid text contains the word
            if (paranoidText.includes(paranoidWord)) {
                const techniques = detectEvasionTechnique(originalText, paranoidText);
                return {
                    matched: true,
                    confidence: 0.95,
                    normalizedText: paranoidText,
                    evasionTechniques: techniques
                };
            }

            // Use higher edit distance threshold for paranoid mode
            const distance = this.levenshteinDistance(paranoidText, paranoidWord);
            const maxLength = Math.max(paranoidText.length, paranoidWord.length);
            const maxAllowedDistance = Math.max(this.options.maxEditDistance, Math.ceil(paranoidWord.length * 0.4));

            if (distance <= maxAllowedDistance) {
                const confidence = 1 - (distance / maxLength);
                const techniques = detectEvasionTechnique(originalText, paranoidText);

                return {
                    matched: confidence >= 0.5, // Lower threshold for paranoid
                    confidence,
                    normalizedText: paranoidText,
                    evasionTechniques: techniques
                };
            }

            return {
                matched: false,
                confidence: 0.0,
                normalizedText: paranoidText,
                evasionTechniques: []
            };
        }

        // Normalize text based on strictness level
        const normalizedText = normalizeForEvasion(text, {
            removeSymbols: this.options.detectSymbolReplacement,
            removeSpaces: this.options.detectSpaceInsertion,
            normalizeRepeated: this.options.detectRepeatedLetters,
            substituteCharacters: true,
            handleLanguageMixing: this.options.detectLanguageMixing
        });

        // Check for exact match after normalization
        if (normalizedText === normalizedWord) {
            const techniques = detectEvasionTechnique(originalText, normalizedText);
            return {
                matched: true,
                confidence: 0.95,
                normalizedText,
                evasionTechniques: techniques
            };
        }

        // HIGH strictness - use Levenshtein distance
        if (this.options.strictness === DetectionStrictness.HIGH) {
            const distance = this.levenshteinDistance(normalizedText, normalizedWord);
            const maxLength = Math.max(normalizedText.length, normalizedWord.length);

            if (distance <= this.options.maxEditDistance) {
                const confidence = 1 - (distance / maxLength);
                const techniques = detectEvasionTechnique(originalText, normalizedText);

                return {
                    matched: confidence >= 0.7,
                    confidence,
                    normalizedText,
                    evasionTechniques: techniques
                };
            }
        }

        return {
            matched: false,
            confidence: 0.0,
            normalizedText,
            evasionTechniques: []
        };
    }

    /**
     * Calculate Levenshtein distance between two strings
     */
    private levenshteinDistance(str1: string, str2: string): number {
        const len1 = str1.length;
        const len2 = str2.length;
        const matrix: number[][] = [];

        // Initialize matrix
        for (let i = 0; i <= len1; i++) {
            matrix[i] = [i];
        }
        for (let j = 0; j <= len2; j++) {
            matrix[0][j] = j;
        }

        // Fill matrix
        for (let i = 1; i <= len1; i++) {
            for (let j = 1; j <= len2; j++) {
                const cost = str1[i - 1] === str2[j - 1] ? 0 : 1;
                matrix[i][j] = Math.min(
                    matrix[i - 1][j] + 1,      // deletion
                    matrix[i][j - 1] + 1,      // insertion
                    matrix[i - 1][j - 1] + cost // substitution
                );
            }
        }

        return matrix[len1][len2];
    }

    /**
     * Check if text contains word with fuzzy matching
     */
    containsWord(text: string, word: string): FuzzyMatchResult {
        const words = text.split(/\s+/);

        for (const textWord of words) {
            const result = this.fuzzyMatch(textWord, word);
            if (result.matched) {
                return result;
            }
        }

        // Check for word within text (no word boundaries)
        const normalizedText = normalizeForEvasion(text);
        const normalizedWord = word.toLowerCase();

        if (normalizedText.includes(normalizedWord)) {
            return {
                matched: true,
                confidence: 0.9,
                normalizedText,
                evasionTechniques: detectEvasionTechnique(text, normalizedText)
            };
        }

        return {
            matched: false,
            confidence: 0.0,
            normalizedText: text,
            evasionTechniques: []
        };
    }

    /**
     * Find all fuzzy matches in text
     */
    findAllMatches(text: string, words: string[]): Array<{
        word: string;
        position: number;
        length: number;
        confidence: number;
        evasionTechniques: string[];
    }> {
        const matches: Array<{
            word: string;
            position: number;
            length: number;
            confidence: number;
            evasionTechniques: string[];
        }> = [];

        for (const word of words) {
            const result = this.containsWord(text, word);
            if (result.matched) {
                // Find position in original text
                const position = text.toLowerCase().indexOf(word.toLowerCase());
                matches.push({
                    word,
                    position: position >= 0 ? position : 0,
                    length: word.length,
                    confidence: result.confidence,
                    evasionTechniques: result.evasionTechniques
                });
            }
        }

        return matches;
    }

    /**
     * Update options
     */
    setOptions(options: Partial<FuzzyMatchOptions>): void {
        this.options = { ...this.options, ...options };
    }

    /**
     * Get current options
     */
    getOptions(): FuzzyMatchOptions {
        return { ...this.options };
    }
}
