# wordguard-filter

High-performance sensitive word detection for Arabic and English with configurable severity levels.

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

## API Reference

### SensitiveWordFilter

Main class for detecting and filtering sensitive words.

#### Constructor

```typescript
new SensitiveWordFilter(options?: FilterOptions)
```

**Options:**
- `minSeverity` - Minimum severity level to detect (default: `SeverityLevel.MILD`)
- `maxSeverity` - Maximum severity level to detect (default: `SeverityLevel.EXTREME`)
- `partialMatch` - Match partial words (default: `false`)
- `normalize` - Normalize text before matching (default: `true`)
- `replaceMatches` - Replace matches with asterisks (default: `false`)
- `replacementChar` - Character to use for replacement (default: `'*'`)
- `languages` - Languages to check (default: `['en', 'ar']`)
- `categories` - Specific categories to check (default: all)

#### Methods

##### `detect(text: string, options?: Partial<FilterOptions>): DetectionResult`

Detect sensitive words in text.

```javascript
const result = filter.detect('This text contains profanity');
console.log(result);
// {
//   hasMatch: true,
//   matches: [
//     {
//       word: 'profanity',
//       severity: 2,
//       category: 'profanity',
//       position: 21,
//       length: 9
//     }
//   ],
//   text: 'This text contains profanity'
// }
```

##### `hasMatch(text: string, options?: Partial<FilterOptions>): boolean`

Check if text contains any sensitive words.

```javascript
const hasMatch = filter.hasMatch('Clean text'); // false
```

##### `clean(text: string, options?: Partial<FilterOptions>): string`

Replace sensitive words with asterisks.

```javascript
const cleaned = filter.clean('This is bad');
console.log(cleaned); // "This is ***"
```

##### `addWord(word: SensitiveWord): void`

Add a custom sensitive word.

```javascript
filter.addWord({
  word: 'custom',
  severity: SeverityLevel.MODERATE,
  category: 'custom',
  language: 'en'
});
```

##### `addWords(words: SensitiveWord[]): void`

Add multiple custom words.

```javascript
filter.addWords([
  { word: 'word1', severity: SeverityLevel.MILD },
  { word: 'word2', severity: SeverityLevel.SEVERE }
]);
```

##### `removeWord(word: string): void`

Remove a custom word.

```javascript
filter.removeWord('custom');
```

##### `clearCustomWords(): void`

Clear all custom words.

```javascript
filter.clearCustomWords();
```

##### `getCustomWords(): SensitiveWord[]`

Get all custom words.

```javascript
const customWords = filter.getCustomWords();
```

##### `setOptions(options: Partial<FilterOptions>): void`

Update filter options.

```javascript
filter.setOptions({
  minSeverity: SeverityLevel.MODERATE,
  languages: ['en']
});
```

##### `getStats(): object`

Get statistics about the word database.

```javascript
const stats = filter.getStats();
console.log(stats);
// {
//   totalWords: 250,
//   customWords: 5,
//   defaultWords: 245,
//   byLanguage: { en: 150, ar: 100 },
//   bySeverity: { 1: 50, 2: 80, 3: 70, 4: 50 },
//   byCategory: { profanity: 60, hate_speech: 40, ... }
// }
```

## Severity Levels

The package uses 4 severity levels:

| Level | Name | Description | Examples |
|-------|------|-------------|----------|
| 1 | MILD | Mild profanity, slang | damn, hell, idiot |
| 2 | MODERATE | Common profanity, offensive terms | ass, shit, loser |
| 3 | SEVERE | Strong profanity, explicit content | fuck, bitch, dick |
| 4 | EXTREME | Extreme hate speech, illegal content | racial slurs, extreme violence |

## Categories

Words are organized into categories:

- **profanity** - General profanity and curse words
- **hate_speech** - Hate speech and discriminatory terms
- **sexual** - Sexual and explicit content
- **violence** - Violence and threats
- **drugs** - Drug-related terms
- **insults** - General insults and offensive terms

## Advanced Usage

### Filter by Severity

```javascript
// Only detect severe and extreme words
const filter = new SensitiveWordFilter({
  minSeverity: SeverityLevel.SEVERE
});

const result = filter.detect('This is damn bad'); // No match (damn is MILD)
```

### Filter by Category

```javascript
// Only detect hate speech
const filter = new SensitiveWordFilter({
  categories: ['hate_speech']
});
```

### Filter by Language

```javascript
// Only detect English words
const filter = new SensitiveWordFilter({
  languages: ['en']
});

// Only detect Arabic words
const arabicFilter = new SensitiveWordFilter({
  languages: ['ar']
});
```

### Arabic Text Support

The package properly handles Arabic text with:
- Diacritic removal
- Unicode normalization
- Character variations (e.g., different forms of Alef)

```javascript
const filter = new SensitiveWordFilter();

// Detects Arabic sensitive words
const result = filter.detect('هذا النص يحتوي على كلمات سيئة');
console.log(result.hasMatch); // true if contains sensitive words
```

### Custom Replacement Character

```javascript
const filter = new SensitiveWordFilter({
  replaceMatches: true,
  replacementChar: '#'
});

const cleaned = filter.clean('This is bad');
console.log(cleaned); // "This is ###"
```

### Partial Matching

```javascript
// Match words even if they're part of other words
const filter = new SensitiveWordFilter({
  partialMatch: true
});

const result = filter.detect('assassin'); // Will match 'ass'
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
  DetectionResult,
  FilterOptions 
} from 'wordguard-filter';

const filter: SensitiveWordFilter = new SensitiveWordFilter();
const result: DetectionResult = filter.detect('test');
```

## Contributing

Contributions are welcome! To add new words or improve the package:

1. Fork the repository
2. Create a feature branch
3. Add words to `src/data/english.json` or `src/data/arabic.json`
4. Submit a pull request

## License

MIT © Nakeebovic

## Disclaimer

This package is designed for content moderation purposes. The word lists are curated for common use cases but may not be exhaustive. Always review and customize the word lists for your specific needs.
