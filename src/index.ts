/**
 * wordguard-filter
 * High-performance sensitive word detection for Arabic and English
 */

import { SensitiveWordFilter } from './filter';
import { DetectionStrictness, FilterOptions, SeverityLevel } from './types';

export { SensitiveWordFilter } from './filter';
export {
    SeverityLevel,
    DetectionStrictness,
    SensitiveWord,
    DetectionResult,
    DetectionMatch,
    FilterOptions
} from './types';
export { normalizeText, normalizeArabic, normalizeEnglish } from './normalizer';
export { FuzzyMatcher } from './fuzzy-matcher';
export { normalizeForEvasion, normalizeParanoid, detectEvasionTechnique } from './evasion-patterns';

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
