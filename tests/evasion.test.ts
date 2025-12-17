import { 
    SensitiveWordFilter, 
    SeverityLevel, 
    DetectionStrictness,
    createParanoidFilter,
    createBalancedFilter,
    createStrictFilter
} from '../src/index';

describe('Evasion Detection', () => {
    describe('Symbol Replacement', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect @ as a', () => {
            expect(filter.hasMatch('f@ck')).toBe(true);
            expect(filter.hasMatch('sh@t')).toBe(true);
            expect(filter.hasMatch('b@stard')).toBe(true);
        });

        test('should detect $ as s', () => {
            expect(filter.hasMatch('$hit')).toBe(true);
            expect(filter.hasMatch('a$$')).toBe(true);
        });

        test('should detect ! as i', () => {
            expect(filter.hasMatch('sh!t')).toBe(true);
            expect(filter.hasMatch('b!tch')).toBe(true);
        });

        test('should detect * as wildcard', () => {
            expect(filter.hasMatch('f*ck')).toBe(true);
            expect(filter.hasMatch('sh*t')).toBe(true);
        });

        test('should detect number substitutions (leet speak)', () => {
            expect(filter.hasMatch('5h1t')).toBe(true);
            expect(filter.hasMatch('fvck')).toBe(true);
            expect(filter.hasMatch('a55')).toBe(true);
        });
    });

    describe('Space Insertion', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect spaced words', () => {
            expect(filter.hasMatch('f u c k')).toBe(true);
            expect(filter.hasMatch('s h i t')).toBe(true);
        });

        test('should detect separator characters', () => {
            expect(filter.hasMatch('f.u.c.k')).toBe(true);
            expect(filter.hasMatch('f-u-c-k')).toBe(true);
            expect(filter.hasMatch('f_u_c_k')).toBe(true);
        });
    });

    describe('Letter Repetition', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect repeated letters', () => {
            expect(filter.hasMatch('fuuuuck')).toBe(true);
            expect(filter.hasMatch('shiiiiit')).toBe(true);
            expect(filter.hasMatch('daaaamn')).toBe(true);
        });

        test('should normalize repeated letters', () => {
            expect(filter.hasMatch('fffuuuucccckkkkk')).toBe(true);
        });
    });

    describe('Mixed Techniques', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect combined evasion techniques', () => {
            expect(filter.hasMatch('f u c k')).toBe(true);
            expect(filter.hasMatch('f-u-c-k')).toBe(true);
            expect(filter.hasMatch('$h!t')).toBe(true);
            expect(filter.hasMatch('f@@ck')).toBe(true);
        });
    });

    describe('Zero-Width Characters', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect words with zero-width spaces', () => {
            expect(filter.hasMatch('fu\u200Bck')).toBe(true);
            expect(filter.hasMatch('sh\u200Bit')).toBe(true);
        });

        test('should detect words with zero-width joiners', () => {
            expect(filter.hasMatch('fu\u200Cck')).toBe(true);
            expect(filter.hasMatch('fu\u200Dck')).toBe(true);
        });
    });

    describe('Unicode Homoglyphs', () => {
        let filter: SensitiveWordFilter;

        beforeEach(() => {
            filter = createParanoidFilter();
        });

        test('should detect Cyrillic lookalikes', () => {
            // Cyrillic 'а' looks like Latin 'a'
            expect(filter.hasMatch('dаmn')).toBe(true); // Cyrillic а
        });

        test('should detect fullwidth characters', () => {
            expect(filter.hasMatch('ｆｕｃｋ')).toBe(true);
        });
    });
});

describe('Context-Aware Detection', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = createBalancedFilter();
    });

    test('should NOT flag "Scunthorpe" as containing profanity', () => {
        expect(filter.hasMatch('I live in Scunthorpe')).toBe(false);
    });

    test('should NOT flag "assessment" as containing profanity', () => {
        expect(filter.hasMatch('The assessment was difficult')).toBe(false);
    });

    test('should NOT flag "class" as containing profanity', () => {
        expect(filter.hasMatch('I have class tomorrow')).toBe(false);
    });

    test('should NOT flag "cocktail" as containing profanity', () => {
        expect(filter.hasMatch('I ordered a cocktail')).toBe(false);
    });

    test('should NOT flag "hello" as containing profanity', () => {
        expect(filter.hasMatch('Hello world')).toBe(false);
    });

    test('should still flag actual profanity', () => {
        expect(filter.hasMatch('fuck this')).toBe(true);
        expect(filter.hasMatch('that is shit')).toBe(true);
    });
});

describe('Whitelist Feature', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = new SensitiveWordFilter();
    });

    test('should allow whitelisted words', () => {
        filter.addWord({
            word: 'custom',
            severity: SeverityLevel.MODERATE
        });
        expect(filter.hasMatch('custom')).toBe(true);

        filter.addToWhitelist('custom');
        expect(filter.hasMatch('custom')).toBe(false);
    });

    test('should add multiple words to whitelist', () => {
        filter.addManyToWhitelist(['damn', 'hell']);
        expect(filter.hasMatch('damn')).toBe(false);
        expect(filter.hasMatch('hell')).toBe(false);
    });

    test('should remove from whitelist', () => {
        filter.addToWhitelist('damn');
        expect(filter.hasMatch('damn')).toBe(false);

        filter.removeFromWhitelist('damn');
        expect(filter.hasMatch('damn')).toBe(true);
    });

    test('should clear whitelist', () => {
        filter.addManyToWhitelist(['damn', 'hell']);
        filter.clearWhitelist();
        expect(filter.hasMatch('damn')).toBe(true);
        expect(filter.hasMatch('hell')).toBe(true);
    });

    test('should check if word is whitelisted', () => {
        filter.addToWhitelist('damn');
        expect(filter.isWhitelisted('damn')).toBe(true);
        expect(filter.isWhitelisted('DAMN')).toBe(true); // Case insensitive
        expect(filter.isWhitelisted('shit')).toBe(false);
    });

    test('should get whitelist entries', () => {
        filter.addToWhitelist('damn');
        filter.addToWhitelist({ word: 'hell', caseSensitive: true });
        
        const whitelist = filter.getWhitelist();
        expect(whitelist.length).toBe(2);
    });
});

describe('Batch Processing', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = new SensitiveWordFilter();
    });

    test('should process batch of texts', () => {
        const texts = [
            'This is clean',
            'This is damn bad',
            'Another clean text',
            'Shit happens'
        ];

        const result = filter.detectBatch(texts);
        
        expect(result.results.length).toBe(4);
        expect(result.totalMatches).toBe(2);
        expect(result.processingTimeMs).toBeGreaterThan(0);
    });

    test('should check if any text has matches', () => {
        const texts = ['clean', 'also clean', 'damn'];
        expect(filter.hasMatchInAny(texts)).toBe(true);

        const cleanTexts = ['clean', 'also clean', 'still clean'];
        expect(filter.hasMatchInAny(cleanTexts)).toBe(false);
    });

    test('should clean batch of texts', () => {
        const texts = ['damn', 'shit', 'clean'];
        const cleaned = filter.cleanBatch(texts);

        expect(cleaned[0]).toContain('****');
        expect(cleaned[1]).toContain('****');
        expect(cleaned[2]).toBe('clean');
    });
});

describe('Async Methods', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = new SensitiveWordFilter();
    });

    test('should detect asynchronously', async () => {
        const result = await filter.detectAsync('This is damn');
        expect(result.hasMatch).toBe(true);
    });

    test('should process batch asynchronously', async () => {
        const texts = Array(50).fill('damn bad text');
        const result = await filter.detectBatchAsync(texts, undefined, 10);

        expect(result.results.length).toBe(50);
        expect(result.totalMatches).toBe(50);
    });
});

describe('Export/Import', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = new SensitiveWordFilter();
    });

    test('should export custom words', () => {
        filter.addWord({
            word: 'custom1',
            severity: SeverityLevel.MILD,
            category: 'test'
        });

        const exported = filter.exportCustomWords();
        
        expect(exported.version).toBe('1.0.0');
        expect(exported.words.length).toBe(1);
        expect(exported.words[0].word).toBe('custom1');
    });

    test('should import words (merge)', () => {
        filter.addWord({
            word: 'existing',
            severity: SeverityLevel.MILD
        });

        filter.importWords({
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            words: [{
                word: 'imported',
                severity: SeverityLevel.MODERATE
            }]
        }, false);

        expect(filter.hasMatch('existing')).toBe(true);
        expect(filter.hasMatch('imported')).toBe(true);
    });

    test('should import words (replace)', () => {
        filter.addWord({
            word: 'existing',
            severity: SeverityLevel.MILD
        });

        filter.importWords({
            version: '1.0.0',
            exportedAt: new Date().toISOString(),
            words: [{
                word: 'imported',
                severity: SeverityLevel.MODERATE
            }]
        }, true);

        expect(filter.hasMatch('existing')).toBe(false);
        expect(filter.hasMatch('imported')).toBe(true);
    });

    test('should export/import as JSON', () => {
        filter.addWord({
            word: 'testword',
            severity: SeverityLevel.MILD
        });

        const json = filter.exportToJSON();
        expect(typeof json).toBe('string');

        const newFilter = new SensitiveWordFilter();
        newFilter.importFromJSON(json);

        expect(newFilter.hasMatch('testword')).toBe(true);
    });

    test('should export/import whitelist', () => {
        filter.addToWhitelist('allowed1');
        filter.addToWhitelist('allowed2');

        const whitelist = filter.exportWhitelist();
        expect(whitelist.length).toBe(2);

        const newFilter = new SensitiveWordFilter();
        newFilter.importWhitelist(whitelist);

        expect(newFilter.isWhitelisted('allowed1')).toBe(true);
        expect(newFilter.isWhitelisted('allowed2')).toBe(true);
    });
});

describe('Strictness Levels', () => {
    test('LOW strictness only matches exact words', () => {
        const filter = new SensitiveWordFilter({
            strictness: DetectionStrictness.LOW,
            enableFuzzyMatching: false
        });

        expect(filter.hasMatch('damn')).toBe(true);
        expect(filter.hasMatch('d@mn')).toBe(false);
        expect(filter.hasMatch('d a m n')).toBe(false);
    });

    test('MEDIUM strictness catches basic evasion', () => {
        const filter = new SensitiveWordFilter({
            strictness: DetectionStrictness.MEDIUM,
            enableFuzzyMatching: true
        });

        expect(filter.hasMatch('damn')).toBe(true);
        expect(filter.hasMatch('d@mn')).toBe(true);
    });

    test('HIGH strictness is more aggressive', () => {
        const filter = createStrictFilter();

        expect(filter.hasMatch('damn')).toBe(true);
        expect(filter.hasMatch('d@mn')).toBe(true);
        expect(filter.hasMatch('daaaamn')).toBe(true);
    });

    test('PARANOID strictness catches everything', () => {
        const filter = createParanoidFilter();

        expect(filter.hasMatch('damn')).toBe(true);
        expect(filter.hasMatch('d@mn')).toBe(true);
        expect(filter.hasMatch('d a m n')).toBe(true);
        expect(filter.hasMatch('daaaamn')).toBe(true);
        expect(filter.hasMatch('d-a-m-n')).toBe(true);
    });
});

describe('Arabic Evasion', () => {
    let filter: SensitiveWordFilter;

    beforeEach(() => {
        filter = createParanoidFilter({ languages: ['ar'] });
    });

    test('should detect Arabic with tatweel', () => {
        // كـلب (kalb with tatweel)
        expect(filter.hasMatch('كـلـب')).toBe(true);
    });

    test('should detect Arabic with diacritics', () => {
        // كَلْب (kalb with diacritics)
        expect(filter.hasMatch('كَلْب')).toBe(true);
    });

    test('should normalize Arabic letter variations', () => {
        // Different forms of Alef
        expect(filter.hasMatch('كلب')).toBe(true);
    });
});

