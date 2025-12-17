import { SensitiveWordFilter, SeverityLevel } from '../src/index';

describe('SensitiveWordFilter', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = new SensitiveWordFilter();
    });

    describe('Basic Detection', () => {
        test('should detect English profanity', () => {
            const result = filter.detect('This is a damn test');
            expect(result.hasMatch).toBe(true);
            expect(result.matches.length).toBeGreaterThan(0);
            expect(result.matches[0].word).toBe('damn');
        });

        test('should detect Arabic profanity', () => {
            const result = filter.detect('هذا نص يحتوي على كلب');
            expect(result.hasMatch).toBe(true);
            expect(result.matches.length).toBeGreaterThan(0);
        });

        test('should not detect clean text', () => {
            const result = filter.detect('This is a nice day');
            expect(result.hasMatch).toBe(false);
            expect(result.matches.length).toBe(0);
        });

        test('should detect multiple words', () => {
            const result = filter.detect('This damn shit is bad');
            expect(result.hasMatch).toBe(true);
            expect(result.matches.length).toBeGreaterThan(1);
        });

        test('should be case insensitive', () => {
            const result1 = filter.detect('DAMN');
            const result2 = filter.detect('damn');
            const result3 = filter.detect('DaMn');

            expect(result1.hasMatch).toBe(true);
            expect(result2.hasMatch).toBe(true);
            expect(result3.hasMatch).toBe(true);
        });
    });

    describe('hasMatch Method', () => {
        test('should return true for text with profanity', () => {
            expect(filter.hasMatch('This is shit')).toBe(true);
        });

        test('should return false for clean text', () => {
            expect(filter.hasMatch('Hello world')).toBe(false);
        });
    });

    describe('clean Method', () => {
        test('should replace profanity with asterisks', () => {
            const cleaned = filter.clean('This is damn bad');
            expect(cleaned).toContain('****');
            expect(cleaned).not.toContain('damn');
        });

        test('should use custom replacement character', () => {
            const customFilter = new SensitiveWordFilter({
                replacementChar: '#'
            });
            const cleaned = customFilter.clean('This is damn');
            expect(cleaned).toContain('####');
        });

        test('should not modify clean text', () => {
            const text = 'This is a nice day';
            const cleaned = filter.clean(text);
            expect(cleaned).toBe(text);
        });
    });

    describe('Severity Filtering', () => {
        test('should filter by minimum severity', () => {
            const severeFilter = new SensitiveWordFilter({
                minSeverity: SeverityLevel.SEVERE
            });

            expect(severeFilter.hasMatch('damn')).toBe(false); // MILD
            expect(severeFilter.hasMatch('shit')).toBe(false); // MODERATE
            expect(severeFilter.hasMatch('fuck')).toBe(true); // SEVERE
        });

        test('should filter by maximum severity', () => {
            const mildFilter = new SensitiveWordFilter({
                maxSeverity: SeverityLevel.MILD
            });

            expect(mildFilter.hasMatch('damn')).toBe(true); // MILD
            expect(mildFilter.hasMatch('shit')).toBe(false); // MODERATE
        });

        test('should filter by severity range', () => {
            const rangeFilter = new SensitiveWordFilter({
                minSeverity: SeverityLevel.MODERATE,
                maxSeverity: SeverityLevel.SEVERE
            });

            expect(rangeFilter.hasMatch('damn')).toBe(false); // MILD
            expect(rangeFilter.hasMatch('shit')).toBe(true); // MODERATE
            expect(rangeFilter.hasMatch('fuck')).toBe(true); // SEVERE
        });
    });

    describe('Language Filtering', () => {
        test('should filter English only', () => {
            const englishFilter = new SensitiveWordFilter({
                languages: ['en']
            });

            expect(englishFilter.hasMatch('damn')).toBe(true);
            expect(englishFilter.hasMatch('كلب')).toBe(false);
        });

        test('should filter Arabic only', () => {
            const arabicFilter = new SensitiveWordFilter({
                languages: ['ar']
            });

            expect(arabicFilter.hasMatch('damn')).toBe(false);
            expect(arabicFilter.hasMatch('كلب')).toBe(true);
        });
    });

    describe('Category Filtering', () => {
        test('should filter by specific category', () => {
            const profanityFilter = new SensitiveWordFilter({
                categories: ['profanity']
            });

            const result = profanityFilter.detect('This is damn');
            expect(result.hasMatch).toBe(true);
        });

        test('should filter multiple categories', () => {
            const multiFilter = new SensitiveWordFilter({
                categories: ['profanity', 'insults']
            });

            expect(multiFilter.hasMatch('damn')).toBe(true);
            expect(multiFilter.hasMatch('idiot')).toBe(true);
        });
    });

    describe('Custom Words', () => {
        test('should add custom word', () => {
            filter.addWord({
                word: 'customword',
                severity: SeverityLevel.MODERATE,
                category: 'custom'
            });

            expect(filter.hasMatch('This contains customword')).toBe(true);
        });

        test('should add multiple custom words', () => {
            filter.addWords([
                { word: 'custom1', severity: SeverityLevel.MILD },
                { word: 'custom2', severity: SeverityLevel.MODERATE }
            ]);

            expect(filter.hasMatch('custom1')).toBe(true);
            expect(filter.hasMatch('custom2')).toBe(true);
        });

        test('should remove custom word', () => {
            filter.addWord({
                word: 'temporary',
                severity: SeverityLevel.MILD
            });

            expect(filter.hasMatch('temporary')).toBe(true);

            filter.removeWord('temporary');
            expect(filter.hasMatch('temporary')).toBe(false);
        });

        test('should clear all custom words', () => {
            filter.addWords([
                { word: 'custom1', severity: SeverityLevel.MILD },
                { word: 'custom2', severity: SeverityLevel.MILD }
            ]);

            filter.clearCustomWords();

            expect(filter.hasMatch('custom1')).toBe(false);
            expect(filter.hasMatch('custom2')).toBe(false);
        });

        test('should get custom words', () => {
            filter.addWord({
                word: 'test',
                severity: SeverityLevel.MILD
            });

            const customWords = filter.getCustomWords();
            expect(customWords.length).toBeGreaterThan(0);
            expect(customWords.some(w => w.word === 'test')).toBe(true);
        });

        test('should throw error for invalid word', () => {
            expect(() => {
                filter.addWord({
                    word: '',
                    severity: SeverityLevel.MILD
                });
            }).toThrow();

            expect(() => {
                filter.addWord({
                    word: 'test',
                    severity: 5 as any // Invalid severity
                });
            }).toThrow();
        });
    });

    describe('Options Management', () => {
        test('should update options', () => {
            filter.setOptions({
                minSeverity: SeverityLevel.SEVERE
            });

            const options = filter.getOptions();
            expect(options.minSeverity).toBe(SeverityLevel.SEVERE);
        });

        test('should apply updated options', () => {
            expect(filter.hasMatch('damn')).toBe(true);

            filter.setOptions({
                minSeverity: SeverityLevel.SEVERE
            });

            expect(filter.hasMatch('damn')).toBe(false);
        });
    });

    describe('Statistics', () => {
        test('should return database statistics', () => {
            const stats = filter.getStats();

            expect(stats.totalWords).toBeGreaterThan(0);
            expect(stats.defaultWords).toBeGreaterThan(0);
            expect(stats.byLanguage.en).toBeGreaterThan(0);
            expect(stats.byLanguage.ar).toBeGreaterThan(0);
            expect(stats.bySeverity[1]).toBeGreaterThan(0);
        });

        test('should include custom words in statistics', () => {
            const statsBefore = filter.getStats();

            filter.addWord({
                word: 'custom',
                severity: SeverityLevel.MILD
            });

            const statsAfter = filter.getStats();
            expect(statsAfter.customWords).toBe(statsBefore.customWords + 1);
            expect(statsAfter.totalWords).toBe(statsBefore.totalWords + 1);
        });
    });

    describe('Edge Cases', () => {
        test('should handle empty string', () => {
            const result = filter.detect('');
            expect(result.hasMatch).toBe(false);
            expect(result.matches.length).toBe(0);
        });

        test('should handle special characters', () => {
            const result = filter.detect('!@#$%^&*()');
            expect(result.hasMatch).toBe(false);
        });

        test('should handle numbers', () => {
            const result = filter.detect('12345');
            expect(result.hasMatch).toBe(false);
        });

        test('should handle mixed content', () => {
            const result = filter.detect('Test123!@# damn test');
            expect(result.hasMatch).toBe(true);
        });

        test('should handle very long text', () => {
            const longText = 'clean '.repeat(10000) + 'damn';
            const result = filter.detect(longText);
            expect(result.hasMatch).toBe(true);
        });
    });

    describe('Arabic Normalization', () => {
        test('should normalize Arabic diacritics', () => {
            // With and without diacritics should match
            const result1 = filter.detect('كَلْب');
            const result2 = filter.detect('كلب');

            expect(result1.hasMatch).toBe(result2.hasMatch);
        });
    });

    describe('Detection Result Structure', () => {
        test('should return correct result structure', () => {
            const result = filter.detect('This is damn');

            expect(result).toHaveProperty('hasMatch');
            expect(result).toHaveProperty('matches');
            expect(result).toHaveProperty('text');
            expect(result.text).toBe('This is damn');
        });

        test('should include match details', () => {
            const result = filter.detect('This is damn');

            expect(result.matches[0]).toHaveProperty('word');
            expect(result.matches[0]).toHaveProperty('severity');
            expect(result.matches[0]).toHaveProperty('position');
            expect(result.matches[0]).toHaveProperty('length');
        });

        test('should include cleaned text when replaceMatches is true', () => {
            const result = filter.detect('This is damn', { replaceMatches: true });

            expect(result).toHaveProperty('cleanedText');
            expect(result.cleanedText).toBeDefined();
            expect(result.cleanedText).toContain('****');
        });
    });
});
