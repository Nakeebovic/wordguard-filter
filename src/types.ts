/**
 * Severity levels for sensitive words
 */
export enum SeverityLevel {
    MILD = 1,
    MODERATE = 2,
    SEVERE = 3,
    EXTREME = 4
}

/**
 * Detection strictness levels for fuzzy matching
 */
export enum DetectionStrictness {
    LOW = 1,       // Only exact matches
    MEDIUM = 2,    // Basic evasion detection (symbols, spaces)
    HIGH = 3,      // Aggressive fuzzy matching (all techniques)
    PARANOID = 4   // Maximum detection - catches EVERYTHING (may have false positives)
}

/**
 * Represents a sensitive word with metadata
 */
export interface SensitiveWord {
    word: string;
    severity: SeverityLevel;
    category?: string;
    language?: 'en' | 'ar';
}

/**
 * Result of a detection operation
 */
export interface DetectionMatch {
    word: string;
    severity: SeverityLevel;
    category?: string;
    position: number;
    length: number;
    confidence?: number;           // Confidence score (0-1) for fuzzy matches
    originalText?: string;         // Original matched text before normalization
    normalizedText?: string;       // Normalized version of matched text
    evasionTechniques?: string[];  // Detected evasion techniques
}

/**
 * Complete detection result
 */
export interface DetectionResult {
    hasMatch: boolean;
    matches: DetectionMatch[];
    text: string;
    cleanedText?: string;
}

/**
 * Configuration options for the filter
 */
export interface FilterOptions {
    /**
     * Minimum severity level to detect (inclusive)
     * @default SeverityLevel.MILD
     */
    minSeverity?: SeverityLevel;

    /**
     * Maximum severity level to detect (inclusive)
     * @default SeverityLevel.EXTREME
     */
    maxSeverity?: SeverityLevel;

    /**
     * Whether to match partial words
     * @default false
     */
    partialMatch?: boolean;

    /**
     * Whether to normalize text before matching
     * @default true
     */
    normalize?: boolean;

    /**
     * Whether to replace matched words with asterisks
     * @default false
     */
    replaceMatches?: boolean;

    /**
     * Custom replacement character
     * @default '*'
     */
    replacementChar?: string;

    /**
     * Languages to check
     * @default ['en', 'ar']
     */
    languages?: ('en' | 'ar')[];

    /**
     * Specific categories to check
     */
    categories?: string[];

    /**
     * Enable fuzzy matching for evasion detection
     * @default false
     */
    enableFuzzyMatching?: boolean;

    /**
     * Detection strictness level
     * @default DetectionStrictness.MEDIUM
     */
    strictness?: DetectionStrictness;

    /**
     * Maximum edit distance for fuzzy matching
     * @default 2
     */
    maxEditDistance?: number;

    /**
     * Detect symbol replacement (e.g., $ -> s)
     * @default true
     */
    detectSymbolReplacement?: boolean;

    /**
     * Detect space insertion (e.g., f u c k)
     * @default true
     */
    detectSpaceInsertion?: boolean;

    /**
     * Detect repeated letters (e.g., shiiiiit)
     * @default true
     */
    detectRepeatedLetters?: boolean;

    /**
     * Detect Arabic/English character mixing
     * @default true
     */
    detectLanguageMixing?: boolean;
}

/**
 * Word database structure
 */
export interface WordDatabase {
    [language: string]: {
        [category: string]: Array<{
            word: string;
            severity: SeverityLevel;
            variations?: string[];
        }>;
    };
}
