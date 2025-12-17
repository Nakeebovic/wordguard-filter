import { AhoCorasickTrie } from './trie';
import { normalizeText } from './normalizer';
import { loadWordDatabase, getFilteredWords, validateWord } from './data/loader';
import { FuzzyMatcher, DetectionStrictness } from './fuzzy-matcher';
import { normalizeForEvasion } from './evasion-patterns';
import {
    SensitiveWord,
    DetectionResult,
    DetectionMatch,
    FilterOptions,
    SeverityLevel
} from './types';

/**
 * Main filter class for detecting sensitive words
 */
export class SensitiveWordFilter {
    private trie: AhoCorasickTrie;
    private customWords: SensitiveWord[];
    private allWords: SensitiveWord[];
    private defaultOptions: Required<FilterOptions>;
    private fuzzyMatcher: FuzzyMatcher;

    constructor(options: FilterOptions = {}) {
        this.trie = new AhoCorasickTrie();
        this.customWords = [];
        this.allWords = [];

        // Set default options
        this.defaultOptions = {
            minSeverity: options.minSeverity ?? SeverityLevel.MILD,
            maxSeverity: options.maxSeverity ?? SeverityLevel.EXTREME,
            partialMatch: options.partialMatch ?? false,
            normalize: options.normalize ?? true,
            replaceMatches: options.replaceMatches ?? false,
            replacementChar: options.replacementChar ?? '*',
            languages: options.languages ?? ['en', 'ar'],
            categories: options.categories ?? [],
            enableFuzzyMatching: options.enableFuzzyMatching ?? false,
            strictness: options.strictness ?? 2, // MEDIUM by default
            maxEditDistance: options.maxEditDistance ?? 2,
            detectSymbolReplacement: options.detectSymbolReplacement ?? true,
            detectSpaceInsertion: options.detectSpaceInsertion ?? true,
            detectRepeatedLetters: options.detectRepeatedLetters ?? true,
            detectLanguageMixing: options.detectLanguageMixing ?? true
        };

        // Initialize fuzzy matcher
        this.fuzzyMatcher = new FuzzyMatcher({
            strictness: this.defaultOptions.strictness as DetectionStrictness,
            maxEditDistance: this.defaultOptions.maxEditDistance,
            detectSymbolReplacement: this.defaultOptions.detectSymbolReplacement,
            detectSpaceInsertion: this.defaultOptions.detectSpaceInsertion,
            detectRepeatedLetters: this.defaultOptions.detectRepeatedLetters,
            detectLanguageMixing: this.defaultOptions.detectLanguageMixing
        });

        // Load default word database
        this.loadDefaultWords();
    }

    /**
     * Load default words from database
     */
    private loadDefaultWords(): void {
        const defaultWords = loadWordDatabase();
        this.allWords = [...defaultWords];
        this.rebuildTrie();
    }

    /**
     * Rebuild the trie with current words and options
     */
    private rebuildTrie(): void {
        this.trie = new AhoCorasickTrie();

        // Get filtered words based on options
        const filteredWords = getFilteredWords(this.allWords, {
            minSeverity: this.defaultOptions.minSeverity,
            maxSeverity: this.defaultOptions.maxSeverity,
            languages: this.defaultOptions.languages,
            categories: this.defaultOptions.categories.length > 0
                ? this.defaultOptions.categories
                : undefined
        });

        // Add words to trie
        for (const word of filteredWords) {
            const normalizedWord = this.defaultOptions.normalize
                ? normalizeText(word.word)
                : word.word.toLowerCase();

            this.trie.insert(normalizedWord, word.severity, word.category);
        }

        // Add custom words
        for (const word of this.customWords) {
            const normalizedWord = this.defaultOptions.normalize
                ? normalizeText(word.word)
                : word.word.toLowerCase();

            this.trie.insert(normalizedWord, word.severity, word.category);
        }

        // Build failure links for Aho-Corasick
        this.trie.buildFailureLinks();
    }

    /**
     * Add a custom sensitive word
     */
    addWord(word: SensitiveWord): void {
        if (!validateWord(word)) {
            throw new Error('Invalid word format');
        }

        this.customWords.push(word);
        this.rebuildTrie();
    }

    /**
     * Add multiple custom words
     */
    addWords(words: SensitiveWord[]): void {
        for (const word of words) {
            if (!validateWord(word)) {
                throw new Error(`Invalid word format: ${JSON.stringify(word)}`);
            }
        }

        this.customWords.push(...words);
        this.rebuildTrie();
    }

    /**
     * Remove a custom word
     */
    removeWord(word: string): void {
        const index = this.customWords.findIndex(w => w.word === word);
        if (index !== -1) {
            this.customWords.splice(index, 1);
            this.rebuildTrie();
        }
    }

    /**
     * Clear all custom words
     */
    clearCustomWords(): void {
        this.customWords = [];
        this.rebuildTrie();
    }

    /**
     * Get all custom words
     */
    getCustomWords(): SensitiveWord[] {
        return [...this.customWords];
    }

    /**
     * Update filter options
     */
    setOptions(options: Partial<FilterOptions>): void {
        this.defaultOptions = {
            ...this.defaultOptions,
            ...options
        };

        // Update fuzzy matcher options
        this.fuzzyMatcher.setOptions({
            strictness: this.defaultOptions.strictness as DetectionStrictness,
            maxEditDistance: this.defaultOptions.maxEditDistance,
            detectSymbolReplacement: this.defaultOptions.detectSymbolReplacement,
            detectSpaceInsertion: this.defaultOptions.detectSpaceInsertion,
            detectRepeatedLetters: this.defaultOptions.detectRepeatedLetters,
            detectLanguageMixing: this.defaultOptions.detectLanguageMixing
        });

        this.rebuildTrie();
    }

    /**
     * Get current options
     */
    getOptions(): FilterOptions {
        return { ...this.defaultOptions };
    }

    /**
     * Detect sensitive words in text
     */
    detect(text: string, options?: Partial<FilterOptions>): DetectionResult {
        const effectiveOptions = options
            ? { ...this.defaultOptions, ...options }
            : this.defaultOptions;

        // Normalize text if needed
        const processedText = effectiveOptions.normalize
            ? normalizeText(text)
            : text;

        // Search for matches using trie
        const rawMatches = this.trie.search(processedText, effectiveOptions.partialMatch);

        // Convert to DetectionMatch format
        let matches: DetectionMatch[] = rawMatches.map(match => ({
            word: match.word,
            severity: match.severity as SeverityLevel,
            category: match.category,
            position: match.position,
            length: match.length
        }));

        // If fuzzy matching is enabled and no matches found, try fuzzy matching
        if (effectiveOptions.enableFuzzyMatching && matches.length === 0) {
            matches = this.fuzzyMatchWords(text, effectiveOptions);
        }

        // Generate cleaned text if replacement is enabled
        let cleanedText: string | undefined;
        if (effectiveOptions.replaceMatches && matches.length > 0) {
            cleanedText = this.replaceMatches(text, matches, effectiveOptions.replacementChar);
        }

        return {
            hasMatch: matches.length > 0,
            matches,
            text,
            cleanedText
        };
    }

    /**
     * Check if text contains sensitive words
     */
    hasMatch(text: string, options?: Partial<FilterOptions>): boolean {
        const result = this.detect(text, options);
        return result.hasMatch;
    }

    /**
     * Clean text by replacing sensitive words
     */
    clean(text: string, options?: Partial<FilterOptions>): string {
        const effectiveOptions = options
            ? { ...this.defaultOptions, ...options, replaceMatches: true }
            : { ...this.defaultOptions, replaceMatches: true };

        const result = this.detect(text, effectiveOptions);
        return result.cleanedText || text;
    }

    /**
     * Perform fuzzy matching against all words
     */
    private fuzzyMatchWords(text: string, options: Required<FilterOptions>): DetectionMatch[] {
        const matches: DetectionMatch[] = [];

        // Get all words that match the current filter criteria
        const filteredWords = getFilteredWords(this.allWords, {
            minSeverity: options.minSeverity,
            maxSeverity: options.maxSeverity,
            languages: options.languages,
            categories: options.categories.length > 0 ? options.categories : undefined
        });

        // Add custom words
        const allWords = [...filteredWords, ...this.customWords];

        // Normalize text for fuzzy matching
        const normalizedText = normalizeForEvasion(text, {
            removeSymbols: options.detectSymbolReplacement,
            removeSpaces: options.detectSpaceInsertion,
            normalizeRepeated: options.detectRepeatedLetters,
            substituteCharacters: true,
            handleLanguageMixing: options.detectLanguageMixing
        });

        // Check each word
        for (const wordEntry of allWords) {
            const normalizedWord = normalizeForEvasion(wordEntry.word, {
                removeSymbols: options.detectSymbolReplacement,
                removeSpaces: options.detectSpaceInsertion,
                normalizeRepeated: options.detectRepeatedLetters,
                substituteCharacters: true,
                handleLanguageMixing: options.detectLanguageMixing
            });

            // Check if normalized text contains the normalized word
            if (normalizedText.includes(normalizedWord)) {
                const position = text.toLowerCase().indexOf(wordEntry.word.toLowerCase());
                matches.push({
                    word: wordEntry.word,
                    severity: wordEntry.severity,
                    category: wordEntry.category || 'unknown',
                    position: position >= 0 ? position : 0,
                    length: wordEntry.word.length
                });
            }
        }

        return matches;
    }

    /**
     * Replace matches in text
     */
    private replaceMatches(
        text: string,
        matches: DetectionMatch[],
        replacementChar: string
    ): string {
        // Sort matches by position (descending) to replace from end to start
        const sortedMatches = [...matches].sort((a, b) => b.position - a.position);

        let result = text;
        for (const match of sortedMatches) {
            const before = result.substring(0, match.position);
            const replacement = replacementChar.repeat(match.length);
            const after = result.substring(match.position + match.length);
            result = before + replacement + after;
        }

        return result;
    }

    /**
     * Get statistics about the word database
     */
    getStats(): {
        totalWords: number;
        customWords: number;
        defaultWords: number;
        byLanguage: { en: number; ar: number };
        bySeverity: { [key: number]: number };
        byCategory: { [key: string]: number };
    } {
        const stats = {
            totalWords: this.allWords.length + this.customWords.length,
            customWords: this.customWords.length,
            defaultWords: this.allWords.length,
            byLanguage: { en: 0, ar: 0 },
            bySeverity: { 1: 0, 2: 0, 3: 0, 4: 0 },
            byCategory: {} as { [key: string]: number }
        };

        const allWords = [...this.allWords, ...this.customWords];

        for (const word of allWords) {
            // Count by language
            if (word.language === 'en') stats.byLanguage.en++;
            if (word.language === 'ar') stats.byLanguage.ar++;

            // Count by severity
            stats.bySeverity[word.severity]++;

            // Count by category
            if (word.category) {
                stats.byCategory[word.category] = (stats.byCategory[word.category] || 0) + 1;
            }
        }

        return stats;
    }
}
