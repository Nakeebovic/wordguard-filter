const { SensitiveWordFilter, SeverityLevel } = require('../dist/index');

console.log('=== Basic Usage Examples ===\n');

// Example 1: Basic detection
console.log('1. Basic Detection:');
const filter = new SensitiveWordFilter();
const result1 = filter.detect('This is a damn test with some shit');
console.log('Text:', result1.text);
console.log('Has Match:', result1.hasMatch);
console.log('Matches:', result1.matches);
console.log();

// Example 2: Clean text
console.log('2. Clean Text:');
const cleaned = filter.clean('This is a damn test with some shit');
console.log('Original:', 'This is a damn test with some shit');
console.log('Cleaned:', cleaned);
console.log();

// Example 3: Check if text has matches
console.log('3. Check for Matches:');
console.log('Has profanity:', filter.hasMatch('This is bad'));
console.log('Is clean:', filter.hasMatch('This is a nice day'));
console.log();

// Example 4: Add custom words
console.log('4. Add Custom Words:');
filter.addWord({
  word: 'badword',
  severity: SeverityLevel.MODERATE,
  category: 'custom',
  language: 'en'
});
console.log('Custom word added:', 'badword');
console.log('Has match:', filter.hasMatch('This contains badword'));
console.log();

// Example 5: Filter by severity
console.log('5. Filter by Severity:');
const severeFilter = new SensitiveWordFilter({
  minSeverity: SeverityLevel.SEVERE
});
console.log('Mild word (damn):', severeFilter.hasMatch('damn')); // false
console.log('Severe word:', severeFilter.hasMatch('fuck')); // true
console.log();

// Example 6: Arabic text
console.log('6. Arabic Text Detection:');
const arabicResult = filter.detect('هذا نص يحتوي على كلمة كلب');
console.log('Has Match:', arabicResult.hasMatch);
console.log('Matches:', arabicResult.matches);
console.log();

// Example 7: Custom replacement character
console.log('7. Custom Replacement:');
const customFilter = new SensitiveWordFilter({
  replaceMatches: true,
  replacementChar: '#'
});
const customCleaned = customFilter.clean('This is shit');
console.log('With # replacement:', customCleaned);
console.log();

// Example 8: Filter by category
console.log('8. Filter by Category:');
const hateSpeechFilter = new SensitiveWordFilter({
  categories: ['hate_speech']
});
console.log('Profanity (shit):', hateSpeechFilter.hasMatch('shit')); // false
console.log('Hate speech:', hateSpeechFilter.hasMatch('nazi')); // true
console.log();

// Example 9: Get statistics
console.log('9. Database Statistics:');
const stats = filter.getStats();
console.log('Total words:', stats.totalWords);
console.log('By language:', stats.byLanguage);
console.log('By severity:', stats.bySeverity);
console.log('By category:', stats.byCategory);
console.log();

// Example 10: Multiple custom words
console.log('10. Add Multiple Custom Words:');
filter.addWords([
  { word: 'spam', severity: SeverityLevel.MILD, category: 'custom' },
  { word: 'scam', severity: SeverityLevel.MODERATE, category: 'custom' }
]);
console.log('Custom words:', filter.getCustomWords().map(w => w.word));
console.log();

console.log('=== Examples Complete ===');
