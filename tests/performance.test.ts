import { SensitiveWordFilter } from '../src/index';

describe('Performance Benchmarks', () => {
    let filter: SensitiveWordFilter;

    beforeAll(() => {
        filter = new SensitiveWordFilter();
    });

    test('should process small text quickly', () => {
        const text = 'This is a test with some profanity damn shit';
        const iterations = 1000;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            filter.detect(text);
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Small text (${text.length} chars): ${timePerIteration.toFixed(3)}ms per detection`);

        expect(timePerIteration).toBeLessThan(10); // Should be < 10ms per detection
    });

    test('should process medium text efficiently', () => {
        const text = 'Lorem ipsum dolor sit amet. '.repeat(100) + 'damn shit fuck';
        const iterations = 100;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            filter.detect(text);
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Medium text (${text.length} chars): ${timePerIteration.toFixed(3)}ms per detection`);

        expect(timePerIteration).toBeLessThan(50); // Should be < 50ms per detection
    });

    test('should process large text efficiently', () => {
        const text = 'Lorem ipsum dolor sit amet. '.repeat(1000) + 'damn shit fuck';
        const iterations = 10;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            filter.detect(text);
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Large text (${text.length} chars): ${timePerIteration.toFixed(3)}ms per detection`);

        expect(timePerIteration).toBeLessThan(100); // Should be < 100ms per detection
    });

    test('should handle multiple matches efficiently', () => {
        const text = 'damn shit fuck ass bitch hell crap piss '.repeat(10);
        const iterations = 100;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            filter.detect(text);
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Multiple matches (${text.length} chars): ${timePerIteration.toFixed(3)}ms per detection`);

        expect(timePerIteration).toBeLessThan(50);
    });

    test('should initialize filter quickly', () => {
        const iterations = 10;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            new SensitiveWordFilter();
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Filter initialization: ${timePerIteration.toFixed(3)}ms`);

        expect(timePerIteration).toBeLessThan(100); // Should initialize in < 100ms
    });

    test('should add custom words efficiently', () => {
        const testFilter = new SensitiveWordFilter();
        const iterations = 100;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            testFilter.addWord({
                word: `custom${i}`,
                severity: 2
            });
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Add custom word: ${timePerIteration.toFixed(3)}ms per word`);

        expect(timePerIteration).toBeLessThan(50); // Should add word in < 50ms
    });

    test('should clean text efficiently', () => {
        const text = 'This damn shit is fucking bad ass hell crap';
        const iterations = 1000;

        const start = Date.now();
        for (let i = 0; i < iterations; i++) {
            filter.clean(text);
        }
        const end = Date.now();

        const timePerIteration = (end - start) / iterations;
        console.log(`Clean text: ${timePerIteration.toFixed(3)}ms per operation`);

        expect(timePerIteration).toBeLessThan(10);
    });

    test('memory usage should be reasonable', () => {
        const stats = filter.getStats();
        console.log('Database statistics:', {
            totalWords: stats.totalWords,
            byLanguage: stats.byLanguage,
            bySeverity: stats.bySeverity
        });

        // Just log memory info, actual memory testing is complex in Jest
        if (global.gc) {
            global.gc();
            const memUsage = process.memoryUsage();
            console.log('Memory usage:', {
                heapUsed: `${(memUsage.heapUsed / 1024 / 1024).toFixed(2)} MB`,
                heapTotal: `${(memUsage.heapTotal / 1024 / 1024).toFixed(2)} MB`
            });
        }
    });
});
