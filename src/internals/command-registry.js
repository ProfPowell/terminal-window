/**
 * Command Registry
 * Handles command registration, aliasing, and execution lookup
 */
export class CommandRegistry {
  constructor() {
    // Command registry - users can register functions that return strings
    this.commands = new Map();

    // Command aliases
    this.aliases = new Map();
  }

  /**
   * Register a command handler
   * @param {string} name - Command name
   * @param {Function} handler - Function that receives args array and returns string or null
   */
  register(name, handler) {
    this.commands.set(name.toLowerCase(), handler);
  }

  /**
   * Unregister a command
   * @param {string} name - Command name
   */
  unregister(name) {
    this.commands.delete(name.toLowerCase());
  }

  /**
   * Register a command alias
   * @param {string} alias - Alias name
   * @param {string} command - Command to execute
   */
  registerAlias(alias, command) {
    this.aliases.set(alias.toLowerCase(), command);
  }

  /**
   * Check if command exists
   * @param {string} name - Command name
   * @returns {boolean}
   */
  has(name) {
    return this.commands.has(name.toLowerCase());
  }

  /**
   * Get a command handler
   * @param {string} name - Command name
   * @returns {Function|undefined}
   */
  get(name) {
    return this.commands.get(name.toLowerCase());
  }

  /**
   * Get all command names
   * @returns {string[]}
   */
  getNames() {
    return Array.from(this.commands.keys()).sort();
  }

  /**
   * Resolve a potential alias
   * @param {string} input - Input string
   * @returns {string} Resolved command string
   */
  resolveAlias(input) {
    const firstWord = input.split(' ')[0].toLowerCase();
    if (this.aliases.has(firstWord)) {
      return this.aliases.get(firstWord) + input.slice(firstWord.length);
    }
    return input;
  }

  /**
   * Parse command string into parts (handles quotes)
   * @param {string} input - Command input
   * @returns {string[]} Array of command parts
   */
  parse(input) {
    const parts = [];
    let current = '';
    let inQuote = false;
    let quoteChar = '';

    for (let i = 0; i < input.length; i++) {
      const char = input[i];

      if (!inQuote && (char === '"' || char === "'")) {
        inQuote = true;
        quoteChar = char;
      } else if (inQuote && char === quoteChar) {
        inQuote = false;
        quoteChar = '';
      } else if (!inQuote && char === ' ') {
        if (current) {
          parts.push(current);
          current = '';
        }
      } else {
        current += char;
      }
    }

    if (current) {
      parts.push(current);
    }

    return parts;
  }
}
