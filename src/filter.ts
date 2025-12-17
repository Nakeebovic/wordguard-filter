import { AhoCorasickTrie } from './trie';
import { normalizeText } from './normalizer';
import { loadWordDatabase, getFilteredWords, validateWord } from './data/loader';
import { FuzzyMatcher } from './fuzzy-matcher';
import { normalizeForEvasion, normalizeParanoid } from './evasion-patterns';
import {
    SensitiveWord,
    DetectionResult,
    DetectionMatch,
    FilterOptions,
    SeverityLevel,
    DetectionStrictness,
    WhitelistEntry,
    BatchDetectionResult,
    WordListExport
} from './types';

/**
 * Common words that contain sensitive substrings but are innocent
 * Used for context-aware detection
 */
const CONTEXT_SAFE_WORDS: Set<string> = new Set([
    // Words containing "ass"
    'assessment', 'assassin', 'assign', 'assist', 'assume', 'associate', 'assemble',
    'class', 'classic', 'mass', 'massive', 'pass', 'passage', 'passenger', 'passion',
    'compass', 'embassy', 'harass', 'brass', 'grass', 'glass', 'bypass', 'trespass',
    'cassette', 'bassoon', 'lasso', 'molasses', 'sassafras', 'ambassador', 'embarrass',
    // Words containing "hell"
    'hello', 'shell', 'shellfish', 'michelle', 'seashell', 'nutshell', 'eggshell',
    // Words containing "damn"
    'goddamn', 'amsterdam',
    // Words containing "cock"
    'cocktail', 'peacock', 'hancock', 'cockpit', 'cockatoo', 'cocoon', 'weathercock',
    // Words containing "dick"
    'dickens', 'dictate', 'dictionary', 'predict', 'verdict', 'addiction', 'benediction',
    // Words containing "cum"
    'document', 'cucumber', 'accumulate', 'circumstance', 'circumference', 'incumbent',
    // Words containing "sex"
    'sextant', 'sextet', 'essex', 'sussex', 'middlesex',
    // Words containing "tit"
    'title', 'entitled', 'institution', 'constitution', 'attitude', 'gratitude',
    'competitive', 'repetitive', 'appetizer', 'titanium', 'titan',
    // Words containing "piss"
    'mississippi',
    // Words containing "anal"
    'analysis', 'analyze', 'analyst', 'analytical', 'canal', 'banal', 'final', 'signal',
    // Words containing "nig"
    'night', 'nightmare', 'knight', 'ignite', 'significant', 'benign', 'malignant',
    // Words containing "fag"
    'fagot', // bundle of sticks
    // Words containing "ho"
    'honest', 'honor', 'horse', 'hospital', 'host', 'hotel', 'hope', 'horizon',
    // Words containing "bitch"
    // Words containing "crap"
    'scrap', 'scrape',
    // Words containing "scum"
    'scumble', // art technique
    // Common place names
    'scunthorpe', 'penistone', 'shitterton', 'cockermouth', 'clitheroe', 'lightwater',
    'arsenal'
]);

/**
 * Required filter options with all defaults applied
 */
type RequiredFilterOptions = Required<Omit<FilterOptions, 'whitelist'>> & {
    whitelist: WhitelistEntry[];
};

/**
 * Main filter class for detecting sensitive words
 */
export class SensitiveWordFilter {
    private trie: AhoCorasickTrie;
    private customWords: SensitiveWord[];
    private allWords: SensitiveWord[];
    private defaultOptions: RequiredFilterOptions;
    private fuzzyMatcher: FuzzyMatcher;
    private whitelist: Set<string>;
    private whitelistEntries: WhitelistEntry[];

    constructor(options: FilterOptions = {}) {
        this.trie = new AhoCorasickTrie();
        this.customWords = [];
        this.allWords = [];
        this.whitelist = new Set();
        this.whitelistEntries = options.whitelist ?? [];

        // Build whitelist set for fast lookup
        this.buildWhitelistSet();

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
            strictness: options.strictness ?? DetectionStrictness.MEDIUM,
            maxEditDistance: options.maxEditDistance ?? 2,
            detectSymbolReplacement: options.detectSymbolReplacement ?? true,
            detectSpaceInsertion: options.detectSpaceInsertion ?? true,
            detectRepeatedLetters: options.detectRepeatedLetters ?? true,
            detectLanguageMixing: options.detectLanguageMixing ?? true,
            contextAware: options.contextAware ?? false,
            whitelist: this.whitelistEntries
        };

        // Initialize fuzzy matcher
        this.fuzzyMatcher = new FuzzyMatcher({
            strictness: this.defaultOptions.strictness,
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
     * Build the whitelist set from entries
     */
    private buildWhitelistSet(): void {
        this.whitelist.clear();
        for (const entry of this.whitelistEntries) {
            const word = entry.caseSensitive ? entry.word : entry.word.toLowerCase();
            this.whitelist.add(word);
        }
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
        // Handle whitelist separately
        if (options.whitelist) {
            this.whitelistEntries = options.whitelist;
            this.buildWhitelistSet();
        }

        this.defaultOptions = {
            ...this.defaultOptions,
            ...options,
            whitelist: this.whitelistEntries
        };

        // Update fuzzy matcher options
        this.fuzzyMatcher.setOptions({
            strictness: this.defaultOptions.strictness,
            maxEditDistance: this.defaultOptions.maxEditDistance,
            detectSymbolReplacement: this.defaultOptions.detectSymbolReplacement,
            detectSpaceInsertion: this.defaultOptions.detectSpaceInsertion,
            detectRepeatedLetters: this.defaultOptions.detectRepeatedLetters,
            detectLanguageMixing: this.defaultOptions.detectLanguageMixing
        });

        this.rebuildTrie();
    }

    /**
     * Add a word to the whitelist
     * @param word - Word or entry to whitelist
     */
    addToWhitelist(word: string | WhitelistEntry): void {
        const entry: WhitelistEntry = typeof word === 'string' 
            ? { word, caseSensitive: false, wholeWord: true }
            : word;
        
        this.whitelistEntries.push(entry);
        const normalizedWord = entry.caseSensitive ? entry.word : entry.word.toLowerCase();
        this.whitelist.add(normalizedWord);
    }

    /**
     * Add multiple words to the whitelist
     * @param words - Words or entries to whitelist
     */
    addManyToWhitelist(words: (string | WhitelistEntry)[]): void {
        for (const word of words) {
            this.addToWhitelist(word);
        }
    }

    /**
     * Remove a word from the whitelist
     * @param word - Word to remove
     */
    removeFromWhitelist(word: string): void {
        const lowerWord = word.toLowerCase();
        this.whitelistEntries = this.whitelistEntries.filter(e => 
            e.word.toLowerCase() !== lowerWord
        );
        this.whitelist.delete(lowerWord);
        this.whitelist.delete(word); // Also try exact case
    }

    /**
     * Clear the entire whitelist
     */
    clearWhitelist(): void {
        this.whitelistEntries = [];
        this.whitelist.clear();
    }

    /**
     * Get all whitelisted words
     * @returns Array of whitelist entries
     */
    getWhitelist(): WhitelistEntry[] {
        return [...this.whitelistEntries];
    }

    /**
     * Check if a word is whitelisted
     * @param word - Word to check
     * @returns True if the word is whitelisted
     */
    isWhitelisted(word: string): boolean {
        return this.whitelist.has(word.toLowerCase()) || this.whitelist.has(word);
    }

    /**
     * Get current options
     */
    getOptions(): FilterOptions {
        return { ...this.defaultOptions };
    }

    /**
     * Escape special regex characters in a string
     * @param str - String to escape
     * @returns Escaped string safe for use in RegExp
     */
    private escapeRegex(str: string): string {
        return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    }

    /**
     * Check if a matched word is actually a standalone word in the text
     * or if it only appears as part of other words
     * @param text - The original text
     * @param matchWord - The matched word to check
     * @returns True if the word exists standalone (not just as part of another word)
     */
    private existsAsStandaloneWord(text: string, matchWord: string): boolean {
        const lowerMatch = matchWord.toLowerCase();
        const escapedMatch = this.escapeRegex(lowerMatch);
        // Create regex for word boundary check
        const wordBoundaryRegex = new RegExp(`\\b${escapedMatch}\\b`, 'i');
        return wordBoundaryRegex.test(text);
    }

    /**
     * Check if the matched word only appears inside safe context words
     * @param text - The original text
     * @param matchWord - The matched word to check
     * @returns True if match only appears in safe words (false positive)
     */
    private isOnlyInSafeContext(text: string, matchWord: string): boolean {
        const lowerText = text.toLowerCase();
        const lowerMatch = matchWord.toLowerCase();
        
        // First, check if the word exists as a standalone word
        if (this.existsAsStandaloneWord(text, matchWord)) {
            return false; // It's standalone, keep the match
        }
        
        // The word only appears inside other words - check if those words are safe
        const words = lowerText.split(/[\s,.\-;:!?"'()[\]{}]+/);
        
        for (const word of words) {
            // Clean the word
            const cleanWord = word.replace(/[^\p{L}\p{N}]/gu, '');
            if (!cleanWord) continue;
            
            // If this word contains the match...
            if (cleanWord.includes(lowerMatch)) {
                // If it's exactly the match word, it's a real match
                if (cleanWord === lowerMatch) {
                    return false;
                }
                // If it's a safe word, this occurrence is safe
                if (CONTEXT_SAFE_WORDS.has(cleanWord)) {
                    continue; // Check other occurrences
                }
                // It's inside a word that's NOT in the safe list - this could be a real match
                // But we should still keep checking other occurrences
            }
        }
        
        // If we get here, the match word was found but only inside safe words
        // or words where it's not standalone
        return true;
    }

    /**
     * Check if a match should be filtered out based on context
     * @param text - Original text
     * @param match - The match to check
     * @param contextAware - Whether to use context-aware detection
     * @returns True if the match should be kept, false if it's a false positive
     */
    private shouldKeepMatch(
        text: string, 
        match: DetectionMatch, 
        contextAware: boolean
    ): boolean {
        // Check whitelist first
        if (this.isWhitelisted(match.word)) {
            return false;
        }

        // Check context-aware detection
        if (contextAware) {
            if (this.isOnlyInSafeContext(text, match.word)) {
                return false;
            }
        }

        return true;
    }

    /**
     * Detect sensitive words in text
     */
    detect(text: string, options?: Partial<FilterOptions>): DetectionResult {
        const effectiveOptions = options
            ? { ...this.defaultOptions, ...options }
            : this.defaultOptions;

        const isParanoidMode = effectiveOptions.strictness === DetectionStrictness.PARANOID;

        // Normalize text if needed
        let processedText: string;
        if (isParanoidMode) {
            // Use paranoid normalization for maximum detection
            processedText = normalizeParanoid(text);
        } else if (effectiveOptions.normalize) {
            processedText = normalizeText(text);
        } else {
            processedText = text;
        }

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

        // If fuzzy matching is enabled, ALWAYS run it (not just when no matches)
        // This catches additional evasion attempts that the trie might miss
        if (effectiveOptions.enableFuzzyMatching) {
            const fuzzyMatches = this.fuzzyMatchWords(text, effectiveOptions);
            
            // Merge matches, avoiding duplicates
            for (const fuzzyMatch of fuzzyMatches) {
                const isDuplicate = matches.some(m => 
                    m.word.toLowerCase() === fuzzyMatch.word.toLowerCase()
                );
                if (!isDuplicate) {
                    matches.push(fuzzyMatch);
                }
            }
        }

        // For paranoid mode, also search with evasion-normalized text
        if (isParanoidMode && effectiveOptions.enableFuzzyMatching) {
            const evasionNormalized = normalizeForEvasion(text, {
                removeSymbols: true,
                removeSpaces: true,
                normalizeRepeated: true,
                substituteCharacters: true,
                handleLanguageMixing: true,
                removeInvisible: true,
                removeTatweel: true,
                normalizeArabic: true
            });
            
            const evasionMatches = this.trie.search(evasionNormalized, true);
            for (const match of evasionMatches) {
                const isDuplicate = matches.some(m => 
                    m.word.toLowerCase() === match.word.toLowerCase()
                );
                if (!isDuplicate) {
                    matches.push({
                        word: match.word,
                        severity: match.severity as SeverityLevel,
                        category: match.category,
                        position: match.position,
                        length: match.length
                    });
                }
            }
        }

        // Apply whitelist and context-aware filtering
        matches = matches.filter(match => 
            this.shouldKeepMatch(text, match, effectiveOptions.contextAware ?? false)
        );

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
        const isParanoidMode = options.strictness === 4; // PARANOID

        // Get all words that match the current filter criteria
        const filteredWords = getFilteredWords(this.allWords, {
            minSeverity: options.minSeverity,
            maxSeverity: options.maxSeverity,
            languages: options.languages,
            categories: options.categories.length > 0 ? options.categories : undefined
        });

        // Add custom words
        const allWords = [...filteredWords, ...this.customWords];

        // Normalize text for fuzzy matching - use paranoid normalization if in paranoid mode
        const normalizedText = isParanoidMode 
            ? normalizeParanoid(text)
            : normalizeForEvasion(text, {
                removeSymbols: options.detectSymbolReplacement,
                removeSpaces: options.detectSpaceInsertion,
                normalizeRepeated: options.detectRepeatedLetters,
                substituteCharacters: true,
                handleLanguageMixing: options.detectLanguageMixing,
                removeInvisible: true,
                removeTatweel: true,
                normalizeArabic: true
            });

        // Check each word
        for (const wordEntry of allWords) {
            const normalizedWord = isParanoidMode
                ? normalizeParanoid(wordEntry.word)
                : normalizeForEvasion(wordEntry.word, {
                    removeSymbols: options.detectSymbolReplacement,
                    removeSpaces: options.detectSpaceInsertion,
                    normalizeRepeated: options.detectRepeatedLetters,
                    substituteCharacters: true,
                    handleLanguageMixing: options.detectLanguageMixing,
                    removeInvisible: true,
                    removeTatweel: true,
                    normalizeArabic: true
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
                continue; // Found match, move to next word
            }

            // For paranoid mode, also use fuzzy matcher for additional detection
            if (isParanoidMode) {
                const fuzzyResult = this.fuzzyMatcher.fuzzyMatch(normalizedText, normalizedWord);
                if (fuzzyResult.matched) {
                    const position = text.toLowerCase().indexOf(wordEntry.word.toLowerCase());
                    matches.push({
                        word: wordEntry.word,
                        severity: wordEntry.severity,
                        category: wordEntry.category || 'unknown',
                        position: position >= 0 ? position : 0,
                        length: wordEntry.word.length,
                        confidence: fuzzyResult.confidence,
                        evasionTechniques: fuzzyResult.evasionTechniques
                    });
                }
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
        whitelistCount: number;
        byLanguage: { en: number; ar: number };
        bySeverity: { [key: number]: number };
        byCategory: { [key: string]: number };
    } {
        const stats = {
            totalWords: this.allWords.length + this.customWords.length,
            customWords: this.customWords.length,
            defaultWords: this.allWords.length,
            whitelistCount: this.whitelistEntries.length,
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

    // ========== BATCH PROCESSING ==========

    /**
     * Detect sensitive words in multiple texts at once
     * More efficient than calling detect() multiple times
     * 
     * @param texts - Array of texts to check
     * @param options - Optional filter options
     * @returns Batch detection result with all results and timing
     */
    detectBatch(texts: string[], options?: Partial<FilterOptions>): BatchDetectionResult {
        const startTime = performance.now();
        const results: DetectionResult[] = [];
        let totalMatches = 0;

        for (const text of texts) {
            const result = this.detect(text, options);
            results.push(result);
            totalMatches += result.matches.length;
        }

        const processingTimeMs = performance.now() - startTime;

        return {
            results,
            processingTimeMs,
            totalMatches
        };
    }

    /**
     * Check if any of the texts contain sensitive words
     * Stops at first match for efficiency
     * 
     * @param texts - Array of texts to check
     * @param options - Optional filter options
     * @returns True if any text contains sensitive words
     */
    hasMatchInAny(texts: string[], options?: Partial<FilterOptions>): boolean {
        for (const text of texts) {
            if (this.hasMatch(text, options)) {
                return true;
            }
        }
        return false;
    }

    /**
     * Clean multiple texts at once
     * 
     * @param texts - Array of texts to clean
     * @param options - Optional filter options
     * @returns Array of cleaned texts
     */
    cleanBatch(texts: string[], options?: Partial<FilterOptions>): string[] {
        return texts.map(text => this.clean(text, options));
    }

    // ========== ASYNC METHODS ==========

    /**
     * Async version of detect for non-blocking processing
     * Useful for processing large texts in web workers or server environments
     * 
     * @param text - Text to check
     * @param options - Optional filter options
     * @returns Promise with detection result
     */
    async detectAsync(text: string, options?: Partial<FilterOptions>): Promise<DetectionResult> {
        return new Promise((resolve) => {
            // Use setImmediate/setTimeout to not block the event loop
            if (typeof setImmediate !== 'undefined') {
                setImmediate(() => resolve(this.detect(text, options)));
            } else {
                setTimeout(() => resolve(this.detect(text, options)), 0);
            }
        });
    }

    /**
     * Async batch detection with chunked processing
     * Prevents blocking the event loop for large batches
     * 
     * @param texts - Array of texts to check
     * @param options - Optional filter options
     * @param chunkSize - Number of texts to process per chunk (default: 100)
     * @returns Promise with batch detection result
     */
    async detectBatchAsync(
        texts: string[], 
        options?: Partial<FilterOptions>,
        chunkSize: number = 100
    ): Promise<BatchDetectionResult> {
        const startTime = performance.now();
        const results: DetectionResult[] = [];
        let totalMatches = 0;

        // Process in chunks to allow event loop to breathe
        for (let i = 0; i < texts.length; i += chunkSize) {
            const chunk = texts.slice(i, i + chunkSize);
            
            // Process chunk
            for (const text of chunk) {
                const result = this.detect(text, options);
                results.push(result);
                totalMatches += result.matches.length;
            }

            // Yield to event loop between chunks
            if (i + chunkSize < texts.length) {
                await new Promise(resolve => {
                    if (typeof setImmediate !== 'undefined') {
                        setImmediate(resolve);
                    } else {
                        setTimeout(resolve, 0);
                    }
                });
            }
        }

        const processingTimeMs = performance.now() - startTime;

        return {
            results,
            processingTimeMs,
            totalMatches
        };
    }

    // ========== EXPORT/IMPORT ==========

    /**
     * Export custom words to a portable format
     * 
     * @returns Exportable word list object
     */
    exportCustomWords(): WordListExport {
        return {
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            words: [...this.customWords]
        };
    }

    /**
     * Import words from an exported word list
     * 
     * @param wordList - Word list to import
     * @param replace - If true, replaces existing custom words; if false, merges
     */
    importWords(wordList: WordListExport, replace: boolean = false): void {
        // Validate version compatibility
        if (!wordList.version || !wordList.words) {
            throw new Error('Invalid word list format');
        }

        // Validate each word
        for (const word of wordList.words) {
            if (!validateWord(word)) {
                throw new Error(`Invalid word in import: ${JSON.stringify(word)}`);
            }
        }

        if (replace) {
            this.customWords = [...wordList.words];
        } else {
            // Merge, avoiding duplicates
            for (const word of wordList.words) {
                const exists = this.customWords.some(w => 
                    w.word.toLowerCase() === word.word.toLowerCase()
                );
                if (!exists) {
                    this.customWords.push(word);
                }
            }
        }

        this.rebuildTrie();
    }

    /**
     * Export custom words as JSON string
     * 
     * @returns JSON string of custom words
     */
    exportToJSON(): string {
        return JSON.stringify(this.exportCustomWords(), null, 2);
    }

    /**
     * Import words from JSON string
     * 
     * @param json - JSON string to import
     * @param replace - If true, replaces existing custom words
     */
    importFromJSON(json: string, replace: boolean = false): void {
        const wordList = JSON.parse(json) as WordListExport;
        this.importWords(wordList, replace);
    }

    /**
     * Export whitelist to portable format
     * 
     * @returns Array of whitelist entries
     */
    exportWhitelist(): WhitelistEntry[] {
        return [...this.whitelistEntries];
    }

    /**
     * Import whitelist entries
     * 
     * @param entries - Whitelist entries to import
     * @param replace - If true, replaces existing whitelist
     */
    importWhitelist(entries: WhitelistEntry[], replace: boolean = false): void {
        if (replace) {
            this.whitelistEntries = [...entries];
        } else {
            for (const entry of entries) {
                const exists = this.whitelistEntries.some(e => 
                    e.word.toLowerCase() === entry.word.toLowerCase()
                );
                if (!exists) {
                    this.whitelistEntries.push(entry);
                }
            }
        }
        this.buildWhitelistSet();
    }
}
