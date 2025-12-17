# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.0.0] - 2024-12-17

### Added

- **Whitelist/Allowlist Feature**: Add words to a whitelist to prevent false positives
  - `addToWhitelist(word)` - Add a single word
  - `addManyToWhitelist(words)` - Add multiple words
  - `removeFromWhitelist(word)` - Remove a word
  - `clearWhitelist()` - Clear all whitelisted words
  - `getWhitelist()` - Get all whitelisted entries
  - `isWhitelisted(word)` - Check if a word is whitelisted

- **Context-Aware Detection**: New `contextAware` option to reduce false positives
  - Automatically handles the "Scunthorpe problem"
  - Words like "assessment", "Scunthorpe", "cocktail" no longer trigger false positives
  - Built-in list of safe words that contain sensitive substrings

- **Batch Processing**: Process multiple texts efficiently
  - `detectBatch(texts)` - Detect in multiple texts at once
  - `cleanBatch(texts)` - Clean multiple texts at once
  - `hasMatchInAny(texts)` - Check if any text has matches
  - Returns timing information for performance monitoring

- **Async Methods**: Non-blocking processing for large texts
  - `detectAsync(text)` - Async version of detect
  - `detectBatchAsync(texts, chunkSize)` - Chunked async batch processing
  - Prevents blocking the event loop

- **Export/Import**: Persist and share custom word lists
  - `exportCustomWords()` - Export custom words as object
  - `importWords(wordList, replace)` - Import word list
  - `exportToJSON()` - Export as JSON string
  - `importFromJSON(json, replace)` - Import from JSON string
  - `exportWhitelist()` - Export whitelist entries
  - `importWhitelist(entries, replace)` - Import whitelist entries

- **New Filter Presets**:
  - `createBalancedFilter()` - Best for production, low false positives
  - `createMinimalFilter()` - Only exact matches, very low false positives

- **New Helper Functions**:
  - `containsProfanity(text)` - Balanced detection helper
  - `cleanProfanity(text)` - Balanced cleaning helper
  - `analyzeText(text)` - Get detailed analysis
  - `getHighestSeverity(text)` - Get highest severity match

- **ESM Support**: Dual CommonJS and ES Module builds
  - Use `import` or `require` as needed
  - Proper TypeScript module resolution

- **Additional Exports**:
  - `hasArabic(text)` - Check if text contains Arabic
  - `hasEnglish(text)` - Check if text contains English
  - `generateEvasionVariants(word)` - Generate evasion variants for a word
  - `CHARACTER_SUBSTITUTIONS` - Character substitution map
  - `ARABIC_SUBSTITUTIONS` - Arabic substitution map
  - `INVISIBLE_CHARACTERS` - List of invisible characters

### Changed

- **Breaking**: Version bumped to 2.0.0
- Improved TypeScript types and documentation
- `DetectionStrictness` enum is now properly shared (was duplicated)
- `getStats()` now includes `whitelistCount`

### Fixed

- Fixed duplicate `DetectionStrictness` enum definition
- Fixed type safety issues with strictness level comparisons

## [1.0.4] - Previous Release

### Features

- High-performance Aho-Corasick algorithm
- Arabic and English support
- Severity levels (MILD, MODERATE, SEVERE, EXTREME)
- Category-based filtering
- Custom word management
- Fuzzy matching and evasion detection
- Paranoid mode for maximum detection

---

## Migration Guide from 1.x to 2.0

### No Breaking Changes Required

Version 2.0 is backwards compatible. All existing code will continue to work.

### Recommended Updates

1. **Use context-aware detection** to reduce false positives:

```javascript
// Before
const filter = new SensitiveWordFilter();

// After (recommended)
const filter = new SensitiveWordFilter({
  contextAware: true
});

// Or use the preset
const filter = createBalancedFilter();
```

2. **Use whitelist** for known safe words in your domain:

```javascript
const filter = new SensitiveWordFilter({ contextAware: true });

// Add domain-specific safe words
filter.addToWhitelist('Scunthorpe');
filter.addToWhitelist('assassin');
```

3. **Use batch processing** for better performance with multiple texts:

```javascript
// Before
const results = texts.map(text => filter.detect(text));

// After (more efficient)
const batchResult = filter.detectBatch(texts);
console.log(`Processed ${texts.length} texts in ${batchResult.processingTimeMs}ms`);
```

4. **Use async methods** for large datasets:

```javascript
// Non-blocking processing
const result = await filter.detectBatchAsync(largeTextArray, 100);
```

