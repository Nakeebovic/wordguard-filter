# wordguard-filter

High-performance sensitive word detection for Arabic and English with configurable severity levels, evasion detection, and context-aware filtering.

[![npm version](https://badge.fury.io/js/wordguard-filter.svg)](https://www.npmjs.com/package/wordguard-filter)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## Features

✨ **High Performance** - Uses Aho-Corasick algorithm for O(n + m + z) time complexity  
🌍 **Multi-language** - Supports both Arabic and English with proper Unicode handling  
📊 **Severity Levels** - 4 configurable severity levels (MILD, MODERATE, SEVERE, EXTREME)  
🔧 **Customizable** - Add your own sensitive words dynamically  
🎯 **Flexible Filtering** - Filter by severity, category, and language  
💪 **TypeScript** - Full TypeScript support with type definitions  
🚀 **Zero Dependencies** - No external runtime dependencies  
🛡️ **Evasion Detection** - Catches leet speak, symbol replacement, zero-width characters  
📋 **Whitelist Support** - Prevent false positives with whitelisted words  
🧠 **Context-Aware** - Smart detection that avoids the "Scunthorpe problem"  
📦 **Batch Processing** - Efficient processing of multiple texts  
⚡ **Async Support** - Non-blocking methods for large-scale processing  

## Installation

```bash
npm install wordguard-filter
```

## Quick Start

```javascript
const { SensitiveWordFilter, SeverityLevel } = require('wordguard-filter');

// Create a filter instance
const filter = new SensitiveWordFilter();

// Detect sensitive words
const result = filter.detect('This is a damn test');
console.log(result.hasMatch); // true
console.log(result.matches); // [{ word: 'damn', severity: 1, position: 10, ... }]

// Clean text by replacing sensitive words
const cleaned = filter.clean('This is a damn test');
console.log(cleaned); // "This is a **** test"

// Check if text contains sensitive words
const hasMatch = filter.hasMatch('Hello world'); // false
```

## Preset Filters

Choose the right filter for your use case:

```javascript
const { 
  createParanoidFilter,   // Maximum detection, may have false positives
  createStrictFilter,     // High detection, fewer false positives
  createBalancedFilter,   // Recommended for production
  createMinimalFilter     // Only exact matches
} = require('wordguard-filter');

// Paranoid mode - catches EVERYTHING including evasion attempts
const paranoid = createParanoidFilter();
paranoid.hasMatch('f u c k'); // true
paranoid.hasMatch('sh!t');    // true

// Balanced mode - best for production, handles Scunthorpe problem
const balanced = createBalancedFilter();
balanced.hasMatch('Scunthorpe');  // false (no false positive!)
balanced.hasMatch('assessment');  // false (no false positive!)
balanced.hasMatch('fuck');        // true
```

## Quick Helper Functions

```javascript
const { 
  hasSensitiveContent,   // Paranoid mode check
  containsProfanity,     // Balanced mode check
  cleanSensitiveContent, // Paranoid mode clean
  cleanProfanity,        // Balanced mode clean
  analyzeText,           // Get detailed results
  getHighestSeverity     // Get max severity
} = require('wordguard-filter');

// Quick checks
if (containsProfanity(userInput)) {
  console.log('Blocked!');
}

// Clean text
const safe = cleanProfanity(userInput);

// Analyze text
const analysis = analyzeText(userInput);
console.log(analysis.matches);

// Get severity
const severity = getHighestSeverity(userInput);
if (severity === SeverityLevel.EXTREME) {
  banUser();
}
```

## API Reference

### SensitiveWordFilter

Main class for detecting and filtering sensitive words.

#### Constructor

```typescript
new SensitiveWordFilter(options?: FilterOptions)
```

**Options:**
| Option | Type | Default | Description |
|--------|------|---------|-------------|
| `minSeverity` | `SeverityLevel` | `MILD` | Minimum severity to detect |
| `maxSeverity` | `SeverityLevel` | `EXTREME` | Maximum severity to detect |
| `partialMatch` | `boolean` | `false` | Match partial words |
| `normalize` | `boolean` | `true` | Normalize text before matching |
| `replaceMatches` | `boolean` | `false` | Replace matches with asterisks |
| `replacementChar` | `string` | `'*'` | Character for replacement |
| `languages` | `('en'\|'ar')[]` | `['en', 'ar']` | Languages to check |
| `categories` | `string[]` | all | Categories to check |
| `enableFuzzyMatching` | `boolean` | `false` | Enable evasion detection |
| `strictness` | `DetectionStrictness` | `MEDIUM` | Detection strictness level |
| `contextAware` | `boolean` | `false` | Enable context-aware detection |
| `whitelist` | `WhitelistEntry[]` | `[]` | Words to allow |

#### Core Methods

```typescript
// Detect sensitive words
detect(text: string, options?: Partial<FilterOptions>): DetectionResult

// Check if text has matches
hasMatch(text: string, options?: Partial<FilterOptions>): boolean

// Clean text by replacing matches
clean(text: string, options?: Partial<FilterOptions>): string
```

#### Whitelist Methods

```typescript
// Add word to whitelist
addToWhitelist(word: string | WhitelistEntry): void

// Add multiple words to whitelist
addManyToWhitelist(words: (string | WhitelistEntry)[]): void

// Remove from whitelist
removeFromWhitelist(word: string): void

// Clear entire whitelist
clearWhitelist(): void

// Get all whitelisted entries
getWhitelist(): WhitelistEntry[]

// Check if word is whitelisted
isWhitelisted(word: string): boolean
```

#### Batch Processing

```typescript
// Detect in multiple texts at once
detectBatch(texts: string[], options?: Partial<FilterOptions>): BatchDetectionResult

// Check if any text has matches
hasMatchInAny(texts: string[], options?: Partial<FilterOptions>): boolean

// Clean multiple texts
cleanBatch(texts: string[], options?: Partial<FilterOptions>): string[]
```

#### Async Methods

```typescript
// Async detection (non-blocking)
async detectAsync(text: string, options?: Partial<FilterOptions>): Promise<DetectionResult>

// Async batch with chunking
async detectBatchAsync(
  texts: string[], 
  options?: Partial<FilterOptions>,
  chunkSize?: number
): Promise<BatchDetectionResult>
```

#### Export/Import

```typescript
// Export custom words
exportCustomWords(): WordListExport
exportToJSON(): string

// Import words
importWords(wordList: WordListExport, replace?: boolean): void
importFromJSON(json: string, replace?: boolean): void

// Export/import whitelist
exportWhitelist(): WhitelistEntry[]
importWhitelist(entries: WhitelistEntry[], replace?: boolean): void
```

## Severity Levels

| Level | Name | Description | Examples |
|-------|------|-------------|----------|
| 1 | MILD | Mild profanity, slang | damn, hell, idiot |
| 2 | MODERATE | Common profanity, offensive terms | ass, shit, loser |
| 3 | SEVERE | Strong profanity, explicit content | fuck, bitch, dick |
| 4 | EXTREME | Extreme hate speech, illegal content | racial slurs, extreme violence |

## Detection Strictness

| Level | Name | Description |
|-------|------|-------------|
| 1 | LOW | Only exact matches |
| 2 | MEDIUM | Basic evasion detection |
| 3 | HIGH | Aggressive fuzzy matching |
| 4 | PARANOID | Maximum detection |

## Categories

Words are organized into categories:

- **profanity** - General profanity and curse words
- **hate_speech** - Hate speech and discriminatory terms
- **sexual** - Sexual and explicit content
- **violence** - Violence and threats
- **drugs** - Drug-related terms
- **insults** - General insults and offensive terms

## Advanced Usage

### Context-Aware Detection

Avoid false positives like the famous "Scunthorpe problem":

```javascript
const filter = new SensitiveWordFilter({
  contextAware: true
});

// These won't trigger false positives
filter.hasMatch('Scunthorpe');  // false
filter.hasMatch('assessment');  // false
filter.hasMatch('cocktail');    // false

// Real profanity still detected
filter.hasMatch('fuck');        // true
```

### Whitelist for Custom Words

```javascript
const filter = new SensitiveWordFilter();

// Whitelist specific words for your domain
filter.addToWhitelist('Scunthorpe');
filter.addToWhitelist('assemble');

// Or add many at once
filter.addManyToWhitelist([
  'class',
  'assessment',
  { word: 'custom', caseSensitive: true }
]);
```

### Evasion Detection

```javascript
const { createParanoidFilter } = require('wordguard-filter');

const filter = createParanoidFilter();

// Catches all these evasion attempts:
filter.hasMatch('f u c k');     // true (space insertion)
filter.hasMatch('sh!t');        // true (symbol replacement)
filter.hasMatch('fuuuuck');     // true (letter repetition)
filter.hasMatch('f@ck');        // true (leet speak)
filter.hasMatch('fu\u200Bck');  // true (zero-width chars)
```

### Batch Processing

```javascript
const filter = new SensitiveWordFilter();

// Process many texts efficiently
const texts = ['text1', 'text2', 'text3', ...];
const result = filter.detectBatch(texts);

console.log(`Found ${result.totalMatches} matches`);
console.log(`Processed in ${result.processingTimeMs}ms`);

// Non-blocking for large batches
const asyncResult = await filter.detectBatchAsync(texts, undefined, 100);
```

### Custom Words

```javascript
const filter = new SensitiveWordFilter();

// Add custom word
filter.addWord({
  word: 'custom',
  severity: SeverityLevel.MODERATE,
  category: 'custom',
  language: 'en'
});

// Export for later use
const json = filter.exportToJSON();
localStorage.setItem('customWords', json);

// Import saved words
const newFilter = new SensitiveWordFilter();
newFilter.importFromJSON(localStorage.getItem('customWords'));
```

### Arabic Text Support

```javascript
const filter = new SensitiveWordFilter();

// Handles Arabic with:
// - Diacritic removal
// - Tatweel (kashida) normalization
// - Character variation handling

const result = filter.detect('هذا النص يحتوي على كلمات سيئة');
console.log(result.hasMatch);
```

## Performance

The package uses the Aho-Corasick algorithm for optimal performance:

- **Time Complexity**: O(n + m + z) where:
  - n = text length
  - m = total pattern length
  - z = number of matches
- **Memory**: ~50MB for full word database
- **Speed**: Process 1MB of text in < 100ms

## TypeScript Support

Full TypeScript support with type definitions:

```typescript
import { 
  SensitiveWordFilter, 
  SeverityLevel,
  DetectionStrictness,
  DetectionResult,
  FilterOptions,
  WhitelistEntry,
  BatchDetectionResult
} from 'wordguard-filter';

const filter: SensitiveWordFilter = new SensitiveWordFilter({
  contextAware: true,
  strictness: DetectionStrictness.MEDIUM
});

const result: DetectionResult = filter.detect('test');
```

## ESM and CommonJS

This package supports both module systems:

```javascript
// CommonJS
const { SensitiveWordFilter } = require('wordguard-filter');

// ESM
import { SensitiveWordFilter } from 'wordguard-filter';
```

## Contributing

Contributions are welcome! To add new words or improve the package:

1. Fork the repository
2. Create a feature branch
3. Add words to `src/data/english.json` or `src/data/arabic.json`
4. Add tests for new features
5. Submit a pull request

## License

MIT © Nakeebovic

## Disclaimer

This package is designed for content moderation purposes. The word lists are curated for common use cases but may not be exhaustive. Always review and customize the word lists for your specific needs.
