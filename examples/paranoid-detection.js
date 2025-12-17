/**
 * Paranoid Detection Example
 * 
 * هذا المثال يوضح كيفية استخدام الوضع المتشدد (Paranoid Mode)
 * الذي يمسك كل محاولات التحايل على الفلتر
 */

const { 
    SensitiveWordFilter, 
    createParanoidFilter,
    createStrictFilter,
    hasSensitiveContent,
    cleanSensitiveContent,
    DetectionStrictness 
} = require('../dist/index');

console.log('=== Paranoid Detection Examples ===\n');

// ========================================
// الطريقة 1: استخدام createParanoidFilter (الأسهل)
// ========================================
console.log('1. Using createParanoidFilter():');
const paranoidFilter = createParanoidFilter();

// أمثلة على محاولات التحايل الإنجليزية
const englishEvasions = [
    'f u c k',           // Space insertion
    'f.u.c.k',           // Dot insertion
    'f_u_c_k',           // Underscore insertion
    'sh!t',              // Symbol replacement (! -> i)
    '$h1t',              // Multiple symbol replacement
    'fuuuuck',           // Letter repetition
    'fück',              // Unicode substitution
    'ƒuck',              // Special character
    's​h​i​t',           // Zero-width spaces (invisible!)
    'SH1T',              // Leet speak + caps
];

console.log('English evasion attempts:');
for (const text of englishEvasions) {
    const result = paranoidFilter.detect(text);
    console.log(`  "${text}" => hasMatch: ${result.hasMatch}`);
    if (result.hasMatch) {
        console.log(`     Detected: ${result.matches.map(m => m.word).join(', ')}`);
    }
}
console.log();

// أمثلة على محاولات التحايل العربية
const arabicEvasions = [
    'كـــلب',            // Tatweel (kashida stretching)
    'ك ل ب',            // Space insertion
    'ك.ل.ب',            // Dot insertion
    'کلب',              // Persian Kaf instead of Arabic
    'ك‌ل‌ب',            // Zero-width non-joiner
    'كَلَب',            // With diacritics (tashkeel)
    'الكلب',            // With definite article
    'کـلـب',            // Combination of tricks
];

console.log('Arabic evasion attempts:');
for (const text of arabicEvasions) {
    const result = paranoidFilter.detect(text);
    console.log(`  "${text}" => hasMatch: ${result.hasMatch}`);
    if (result.hasMatch) {
        console.log(`     Detected: ${result.matches.map(m => m.word).join(', ')}`);
    }
}
console.log();

// ========================================
// الطريقة 2: استخدام hasSensitiveContent (للفحص السريع)
// ========================================
console.log('2. Quick Check with hasSensitiveContent():');
const textsToCheck = [
    'Hello, how are you?',
    'What the f u c k!',
    'هذا نص عادي',
    'أنت كـــلب',
];

for (const text of textsToCheck) {
    const hasBadContent = hasSensitiveContent(text);
    console.log(`  "${text}" => ${hasBadContent ? '❌ BLOCKED' : '✅ CLEAN'}`);
}
console.log();

// ========================================
// الطريقة 3: تنظيف النص تلقائياً
// ========================================
console.log('3. Auto-clean with cleanSensitiveContent():');
const dirtyTexts = [
    'What the f u c k is this sh!t?',
    'You are a كـــلب!',
    'This is $h1t',
];

for (const text of dirtyTexts) {
    const cleaned = cleanSensitiveContent(text);
    console.log(`  Original: "${text}"`);
    console.log(`  Cleaned:  "${cleaned}"`);
}
console.log();

// ========================================
// الطريقة 4: إنشاء فلتر مخصص مع paranoid mode
// ========================================
console.log('4. Custom Paranoid Filter:');
const customParanoid = new SensitiveWordFilter({
    enableFuzzyMatching: true,
    strictness: DetectionStrictness.PARANOID,
    partialMatch: true,
    detectSymbolReplacement: true,
    detectSpaceInsertion: true,
    detectRepeatedLetters: true,
    detectLanguageMixing: true,
    replaceMatches: true,
    replacementChar: '█',
    languages: ['en', 'ar'],
});

const testText = 'Hey $h!t, this is fuuuuck1ng crazy!';
const result = customParanoid.detect(testText);
console.log(`  Text: "${testText}"`);
console.log(`  Cleaned: "${result.cleanedText}"`);
console.log(`  Matches found: ${result.matches.length}`);
console.log();

// ========================================
// الطريقة 5: مقارنة بين المستويات المختلفة
// ========================================
console.log('5. Comparing Strictness Levels:');
const evasionText = 'This is $h!t and f u c k';

const levels = [
    { name: 'LOW', filter: new SensitiveWordFilter({ strictness: DetectionStrictness.LOW, enableFuzzyMatching: true }) },
    { name: 'MEDIUM', filter: new SensitiveWordFilter({ strictness: DetectionStrictness.MEDIUM, enableFuzzyMatching: true }) },
    { name: 'HIGH', filter: new SensitiveWordFilter({ strictness: DetectionStrictness.HIGH, enableFuzzyMatching: true }) },
    { name: 'PARANOID', filter: createParanoidFilter() },
];

console.log(`  Testing: "${evasionText}"`);
for (const { name, filter } of levels) {
    const res = filter.detect(evasionText);
    console.log(`  ${name}: ${res.matches.length} matches found`);
}
console.log();

// ========================================
// الطريقة 6: استخدام createStrictFilter (توازن بين الدقة والكشف)
// ========================================
console.log('6. Using createStrictFilter() (balanced mode):');
const strictFilter = createStrictFilter();

const balancedTests = [
    'f u c k',        // Should detect
    'fck',            // May or may not detect (abbreviated)
    'shift',          // Should NOT detect (legitimate word)
    'class',          // Should NOT detect (legitimate word)
];

for (const text of balancedTests) {
    const res = strictFilter.detect(text);
    console.log(`  "${text}" => ${res.hasMatch ? 'DETECTED' : 'clean'}`);
}
console.log();

console.log('=== Examples Complete ===');
console.log('\n💡 Tip: Use createParanoidFilter() when you want MAXIMUM detection.');
console.log('💡 Tip: Use createStrictFilter() for a good balance between detection and false positives.');

