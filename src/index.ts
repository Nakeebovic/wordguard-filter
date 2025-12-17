/**
 * wordguard-filter
 * High-performance sensitive word detection for Arabic and English
 */

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
export { normalizeForEvasion, detectEvasionTechnique } from './evasion-patterns';
