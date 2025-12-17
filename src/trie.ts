/**
 * Trie node for efficient pattern matching
 */
class TrieNode {
    children: Map<string, TrieNode>;
    isEndOfWord: boolean;
    severity: number;
    category: string;
    originalWord: string;

    constructor() {
        this.children = new Map();
        this.isEndOfWord = false;
        this.severity = 0;
        this.category = '';
        this.originalWord = '';
    }
}

/**
 * Aho-Corasick Trie for efficient multi-pattern matching
 * Time complexity: O(n + m + z) where n=text length, m=total pattern length, z=matches
 */
export class AhoCorasickTrie {
    private root: TrieNode;
    private failureLinks: Map<TrieNode, TrieNode>;

    constructor() {
        this.root = new TrieNode();
        this.failureLinks = new Map();
    }

    /**
     * Insert a word into the trie
     */
    insert(word: string, severity: number, category: string = ''): void {
        let node = this.root;
        const normalizedWord = word.toLowerCase();

        for (const char of normalizedWord) {
            if (!node.children.has(char)) {
                node.children.set(char, new TrieNode());
            }
            node = node.children.get(char)!;
        }

        node.isEndOfWord = true;
        node.severity = severity;
        node.category = category;
        node.originalWord = word;
    }

    /**
     * Build failure links for Aho-Corasick algorithm
     */
    buildFailureLinks(): void {
        const queue: TrieNode[] = [];

        // Initialize failure links for depth 1
        for (const child of this.root.children.values()) {
            this.failureLinks.set(child, this.root);
            queue.push(child);
        }

        // BFS to build failure links
        while (queue.length > 0) {
            const current = queue.shift()!;

            for (const [char, child] of current.children) {
                queue.push(child);

                let failNode = this.failureLinks.get(current);
                while (failNode && failNode !== this.root && !failNode.children.has(char)) {
                    failNode = this.failureLinks.get(failNode);
                }

                if (failNode && failNode.children.has(char) && failNode.children.get(char) !== child) {
                    this.failureLinks.set(child, failNode.children.get(char)!);
                } else {
                    this.failureLinks.set(child, this.root);
                }
            }
        }
    }

    /**
     * Search for all patterns in the text
     */
    search(text: string, partialMatch: boolean = false): Array<{
        word: string;
        severity: number;
        category: string;
        position: number;
        length: number;
    }> {
        const results: Array<{
            word: string;
            severity: number;
            category: string;
            position: number;
            length: number;
        }> = [];

        const normalizedText = text.toLowerCase();
        let node = this.root;

        for (let i = 0; i < normalizedText.length; i++) {
            const char = normalizedText[i];

            // Follow failure links if no match
            while (node !== this.root && !node.children.has(char)) {
                node = this.failureLinks.get(node) || this.root;
            }

            // Move to next node if possible
            if (node.children.has(char)) {
                node = node.children.get(char)!;
            }

            // Check if we've found a match
            let checkNode: TrieNode | undefined = node;
            while (checkNode && checkNode !== this.root) {
                if (checkNode.isEndOfWord) {
                    const wordLength = checkNode.originalWord.length;
                    const position = i - wordLength + 1;

                    // Check word boundaries if not partial match
                    if (partialMatch || this.isWordBoundary(normalizedText, position, position + wordLength)) {
                        results.push({
                            word: checkNode.originalWord,
                            severity: checkNode.severity,
                            category: checkNode.category,
                            position,
                            length: wordLength
                        });
                    }
                }
                checkNode = this.failureLinks.get(checkNode);
            }
        }

        return results;
    }

    /**
     * Check if position is at a word boundary
     */
    private isWordBoundary(text: string, start: number, end: number): boolean {
        const beforeIsValid = start === 0 || !this.isWordChar(text[start - 1]);
        const afterIsValid = end >= text.length || !this.isWordChar(text[end]);
        return beforeIsValid && afterIsValid;
    }

    /**
     * Check if character is a word character
     */
    private isWordChar(char: string): boolean {
        // Support English, Arabic, and numbers
        return /[\w\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(char);
    }

    /**
     * Get the root node (for testing)
     */
    getRoot(): TrieNode {
        return this.root;
    }
}
