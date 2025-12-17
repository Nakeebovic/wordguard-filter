/**
 * wordguard-filter
 * High-performance sensitive word detection for Arabic and English
 * 
 * @packageDocumentation
 */

import { SensitiveWordFilter } from './filter';
import { DetectionStrictness, FilterOptions, SeverityLevel } from './types';

// ========== CORE EXPORTS ==========

export { SensitiveWordFilter } from './filter';
export {
    SeverityLevel,
    DetectionStrictness,
    SensitiveWord,
    DetectionResult,
    DetectionMatch,
    FilterOptions,
    WhitelistEntry,
    BatchDetectionResult,
    WordListExport
} from './types';

// ========== UTILITY EXPORTS ==========

export { normalizeText, normalizeArabic, normalizeEnglish, hasArabic, hasEnglish } from './normalizer';
export { FuzzyMatcher } from './fuzzy-matcher';
export { 
    normalizeForEvasion, 
    normalizeParanoid, 
    detectEvasionTechnique,
    generateEvasionVariants,
    CHARACTER_SUBSTITUTIONS,
    ARABIC_SUBSTITUTIONS,
    INVISIBLE_CHARACTERS
} from './evasion-patterns';

// ========== PRESET FILTER FACTORIES ==========

/**
 * Create a paranoid filter that catches EVERYTHING
 * Maximum detection mode - may have some false positives but won't miss evasion attempts
 * 
 * @param additionalOptions - Additional options to merge with paranoid defaults
 * @returns A configured SensitiveWordFilter instance
 * 
 * @example
 * ```typescript
 * import { createParanoidFilter } from 'wordguard-filter';
 * 
 * const filter = createParanoidFilter();
 * 
 * // Will catch evasion attempts like:
 * // - "f u c k" (space insertion)
 * // - "sh!t" (symbol replacement)
 * // - "fuuuuck" (letter repetition)
 * // - "كـــلب" (Arabic tatweel)
 * // - "ك‌ل‌ب" (zero-width characters)
 * 
 * const result = filter.detect("sh!t h@ppens");
 * console.log(result.hasMatch); // true
 * ```
 */
export function createParanoidFilter(additionalOptions?: Partial<FilterOptions>): SensitiveWordFilter {
    return new SensitiveWordFilter({
        enableFuzzyMatching: true,
        strictness: DetectionStrictness.PARANOID,
        partialMatch: true,
        normalize: true,
        detectSymbolReplacement: true,
        detectSpaceInsertion: true,
        detectRepeatedLetters: true,
        detectLanguageMixing: true,
        maxEditDistance: 3,
        minSeverity: SeverityLevel.MILD,
        ...additionalOptions
    });
}

/**
 * Create a strict filter with high detection but fewer false positives
 * Good balance between detection and accuracy
 * 
 * @param additionalOptions - Additional options to merge with strict defaults
 * @returns A configured SensitiveWordFilter instance
 */
export function createStrictFilter(additionalOptions?: Partial<FilterOptions>): SensitiveWordFilter {
    return new SensitiveWordFilter({
        enableFuzzyMatching: true,
        strictness: DetectionStrictness.HIGH,
        partialMatch: true,
        normalize: true,
        detectSymbolReplacement: true,
        detectSpaceInsertion: true,
        detectRepeatedLetters: true,
        detectLanguageMixing: true,
        maxEditDistance: 2,
        minSeverity: SeverityLevel.MILD,
        ...additionalOptions
    });
}

/**
 * Create a balanced filter with context-aware detection
 * Best for production use - catches real profanity while avoiding false positives
 * 
 * @param additionalOptions - Additional options to merge with balanced defaults
 * @returns A configured SensitiveWordFilter instance
 * 
 * @example
 * ```typescript
 * import { createBalancedFilter } from 'wordguard-filter';
 * 
 * const filter = createBalancedFilter();
 * 
 * // Won't false positive on words like "Scunthorpe" or "assassin"
 * console.log(filter.hasMatch("Scunthorpe")); // false
 * console.log(filter.hasMatch("assessment")); // false
 * console.log(filter.hasMatch("fuck")); // true
 * ```
 */
export function createBalancedFilter(additionalOptions?: Partial<FilterOptions>): SensitiveWordFilter {
    return new SensitiveWordFilter({
        enableFuzzyMatching: true,
        strictness: DetectionStrictness.MEDIUM,
        partialMatch: false,
        normalize: true,
        contextAware: true,
        detectSymbolReplacement: true,
        detectSpaceInsertion: true,
        detectRepeatedLetters: true,
        detectLanguageMixing: false,
        maxEditDistance: 1,
        minSeverity: SeverityLevel.MILD,
        ...additionalOptions
    });
}

/**
 * Create a minimal filter that only catches exact matches
 * Best for low false positive requirements
 * 
 * @param additionalOptions - Additional options to merge with minimal defaults
 * @returns A configured SensitiveWordFilter instance
 */
export function createMinimalFilter(additionalOptions?: Partial<FilterOptions>): SensitiveWordFilter {
    return new SensitiveWordFilter({
        enableFuzzyMatching: false,
        strictness: DetectionStrictness.LOW,
        partialMatch: false,
        normalize: true,
        contextAware: true,
        minSeverity: SeverityLevel.MODERATE,
        ...additionalOptions
    });
}

// ========== QUICK HELPER FUNCTIONS ==========

/**
 * Quick check if text contains sensitive content using paranoid mode
 * 
 * @param text - Text to check
 * @returns True if sensitive content detected
 * 
 * @example
 * ```typescript
 * import { hasSensitiveContent } from 'wordguard-filter';
 * 
 * if (hasSensitiveContent("f u c k this")) {
 *   console.log("Blocked!");
 * }
 * ```
 */
export function hasSensitiveContent(text: string): boolean {
    const filter = createParanoidFilter();
    return filter.hasMatch(text);
}

/**
 * Quick check if text contains sensitive content (balanced mode)
 * Lower false positives than hasSensitiveContent
 * 
 * @param text - Text to check
 * @returns True if sensitive content detected
 */
export function containsProfanity(text: string): boolean {
    const filter = createBalancedFilter();
    return filter.hasMatch(text);
}

/**
 * Quick clean text by removing/replacing sensitive content using paranoid mode
 * 
 * @param text - Text to clean
 * @param replacementChar - Character to replace with (default: '*')
 * @returns Cleaned text
 */
export function cleanSensitiveContent(text: string, replacementChar: string = '*'): string {
    const filter = createParanoidFilter({
        replaceMatches: true,
        replacementChar
    });
    return filter.clean(text);
}

/**
 * Quick clean text with balanced detection
 * 
 * @param text - Text to clean
 * @param replacementChar - Character to replace with (default: '*')
 * @returns Cleaned text
 */
export function cleanProfanity(text: string, replacementChar: string = '*'): string {
    const filter = createBalancedFilter({
        replaceMatches: true,
        replacementChar
    });
    return filter.clean(text);
}

/**
 * Analyze text and return detailed detection results
 * 
 * @param text - Text to analyze
 * @returns Detection result with all matches and metadata
 */
export function analyzeText(text: string): ReturnType<SensitiveWordFilter['detect']> {
    const filter = createBalancedFilter();
    return filter.detect(text);
}

/**
 * Get the severity level of the most severe match in text
 * 
 * @param text - Text to check
 * @returns Highest severity level found, or null if no matches
 */
export function getHighestSeverity(text: string): SeverityLevel | null {
    const filter = createBalancedFilter();
    const result = filter.detect(text);
    
    if (!result.hasMatch) {
        return null;
    }
    
    return Math.max(...result.matches.map(m => m.severity)) as SeverityLevel;
}

// ========== DEFAULT EXPORT ==========

/**
 * Default export - the main filter class
 */
export default SensitiveWordFilter;
