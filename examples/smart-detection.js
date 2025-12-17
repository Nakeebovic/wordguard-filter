const { SensitiveWordFilter, FuzzyMatcher, DetectionStrictness, normalizeForEvasion } = require('../dist/index');

console.log('=== Smart Detection Examples ===\n');

// Example 1: Symbol Replacement Detection
console.log('1. Symbol Replacement Detection:');
const text1 = 'This is sh!t and a$$hole behavior';
const normalized1 = normalizeForEvasion(text1);
console.log('Original:', text1);
console.log('Normalized:', normalized1);
console.log();

// Example 2: Space Insertion Detection
console.log('2. Space Insertion Detection:');
const text2 = 'f u c k this s h i t';
const normalized2 = normalizeForEvasion(text2);
console.log('Original:', text2);
console.log('Normalized:', normalized2);
console.log();

// Example 3: Repeated Letters Detection
console.log('3. Repeated Letters Detection:');
const text3 = 'shiiiiiiit daaaaaaamn';
const normalized3 = normalizeForEvasion(text3);
console.log('Original:', text3);
console.log('Normalized:', normalized3);
console.log();

// Example 4: Leet Speak Detection
console.log('4. Leet Speak Detection:');
const text4 = 'f*ck th1s sh1t';
const normalized4 = normalizeForEvasion(text4);
console.log('Original:', text4);
console.log('Normalized:', normalized4);
console.log();

// Example 5: Fuzzy Matcher with Different Strictness Levels
console.log('5. Fuzzy Matcher - LOW Strictness (exact match only):');
const fuzzyLow = new FuzzyMatcher({ strictness: DetectionStrictness.LOW });
const result1 = fuzzyLow.fuzzyMatch('fuck', 'fuck');
const result2 = fuzzyLow.fuzzyMatch('f*ck', 'fuck');
console.log('  "fuck" matches "fuck":', result1.matched, `(confidence: ${result1.confidence})`);
console.log('  "f*ck" matches "fuck":', result2.matched, `(confidence: ${result2.confidence})`);
console.log();

console.log('6. Fuzzy Matcher - MEDIUM Strictness (basic evasion):');
const fuzzyMed = new FuzzyMatcher({ strictness: DetectionStrictness.MEDIUM });
const result3 = fuzzyMed.fuzzyMatch('f*ck', 'fuck');
const result4 = fuzzyMed.fuzzyMatch('f u c k', 'fuck');
console.log('  "f*ck" matches "fuck":', result3.matched, `(confidence: ${result3.confidence.toFixed(2)})`);
console.log('  "f u c k" matches "fuck":', result4.matched, `(confidence: ${result4.confidence.toFixed(2)})`);
console.log('  Evasion techniques:', result3.evasionTechniques);
console.log();

console.log('7. Fuzzy Matcher - HIGH Strictness (aggressive):');
const fuzzyHigh = new FuzzyMatcher({ strictness: DetectionStrictness.HIGH });
const result5 = fuzzyHigh.fuzzyMatch('fvck', 'fuck');
const result6 = fuzzyHigh.fuzzyMatch('phuck', 'fuck');
console.log('  "fvck" matches "fuck":', result5.matched, `(confidence: ${result5.confidence.toFixed(2)})`);
console.log('  "phuck" matches "fuck":', result6.matched, `(confidence: ${result6.confidence.toFixed(2)})`);
console.log();

// Example 8: Database Statistics
console.log('8. Expanded Database Statistics:');
const filter = new SensitiveWordFilter();
const stats = filter.getStats();
console.log('Total words:', stats.totalWords);
console.log('By language:', stats.byLanguage);
console.log('By severity:', stats.bySeverity);
console.log('Categories:', Object.keys(stats.byCategory));
console.log();

// Example 9: Detection with Expanded Database
console.log('9. Detection with Expanded Database:');
const testTexts = [
  'This is bullshit',
  'You are a douchebag',
  'Stop being a wanker',
  'That is bollocks'
];

for (const text of testTexts) {
  const result = filter.detect(text);
  if (result.hasMatch) {
    console.log(`  "${text}" -> Found: ${result.matches.map(m => m.word).join(', ')}`);
  }
}
console.log();

// Example 10: Arabic Detection
console.log('10. Arabic Word Detection:');
const arabicTexts = [
  'هذا كلام خرا',
  'انت حمار',
  'يا كلب'
];

for (const text of arabicTexts) {
  const result = filter.detect(text);
  if (result.hasMatch) {
    console.log(`  "${text}" -> Found ${result.matches.length} match(es)`);
  }
}

console.log('\n=== Smart Detection Examples Complete ===');
