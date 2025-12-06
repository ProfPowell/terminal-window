/**
 * History Manager
 * Handles storage and navigation of command history
 */
export class HistoryManager {
  constructor() {
    this.history = [];
    this.index = -1;
  }

  /**
   * Add a command to history
   * @param {string} command - Command to add
   */
  add(command) {
    this.history.push(command);
    this.index = this.history.length;
  }

  /**
   * Navigate history
   * @param {number} direction - Direction (-1 for up/back, 1 for down/forward)
   * @returns {string|null} The command at the new index, or null if out of bounds (or empty string if new line)
   */
  navigate(direction) {
    const newIndex = this.index + direction;

    if (newIndex < 0) return null;
    
    if (newIndex >= this.history.length) {
      this.index = this.history.length;
      return '';
    }
    
    this.index = newIndex;
    return this.history[this.index];
  }

  /**
   * Get the current history array (copy)
   * @returns {string[]}
   */
  getHistory() {
    return [...this.history];
  }

  /**
   * Set the history array
   * @param {string[]} history 
   */
  setHistory(history) {
    if (Array.isArray(history)) {
      this.history = history.map(cmd => String(cmd));
      this.index = this.history.length;
    }
  }

  /**
   * Clear history
   */
  clear() {
    this.history = [];
    this.index = -1;
  }

  /**
   * Get formatted history for display
   * @returns {string} Formatted history string
   */
  getFormattedHistory() {
    return this.history.map((cmd, i) => `  ${i + 1}  ${cmd}`).join('\n');
  }

  /**
   * Check if history is empty
   * @returns {boolean}
   */
  isEmpty() {
    return this.history.length === 0;
  }
}
