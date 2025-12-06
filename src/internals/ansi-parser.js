/**
 * ANSI Escape Code Parser
 * Handles parsing of ANSI color codes and styles into HTML
 */
export class AnsiParser {
  constructor() {
    // ANSI color code mappings
    this.ansiColors = {
      '30': 'ansi-black',
      '31': 'ansi-red',
      '32': 'ansi-green',
      '33': 'ansi-yellow',
      '34': 'ansi-blue',
      '35': 'ansi-magenta',
      '36': 'ansi-cyan',
      '37': 'ansi-white',
      '90': 'ansi-bright-black',
      '91': 'ansi-bright-red',
      '92': 'ansi-bright-green',
      '93': 'ansi-bright-yellow',
      '94': 'ansi-bright-blue',
      '95': 'ansi-bright-magenta',
      '96': 'ansi-bright-cyan',
      '97': 'ansi-bright-white',
    };

    this.ansiBgColors = {
      '40': 'ansi-bg-black',
      '41': 'ansi-bg-red',
      '42': 'ansi-bg-green',
      '43': 'ansi-bg-yellow',
      '44': 'ansi-bg-blue',
      '45': 'ansi-bg-magenta',
      '46': 'ansi-bg-cyan',
      '47': 'ansi-bg-white',
    };
  }

  /**
   * Parse ANSI escape codes and convert to HTML
   * @param {string} text - Text with ANSI codes
   * @param {Function} escapeHtml - Function to escape HTML
   * @returns {string} HTML string
   */
  parse(text, escapeHtml) {
    // Match ANSI escape sequences
    const ansiRegex = /\x1b\[([0-9;]+)m/g;
    let result = '';
    let lastIndex = 0;
    let currentClasses = [];
    let match;

    while ((match = ansiRegex.exec(text)) !== null) {
      // Add text before this match
      if (match.index > lastIndex) {
        const textBefore = escapeHtml(text.slice(lastIndex, match.index));
        if (currentClasses.length > 0) {
          result += `<span class="${currentClasses.join(' ')}">${textBefore}</span>`;
        } else {
          result += textBefore;
        }
      }

      // Parse the codes
      const codes = match[1].split(';');
      for (const code of codes) {
        if (code === '0') {
          // Reset
          currentClasses = [];
        } else if (code === '1') {
          currentClasses.push('ansi-bold');
        } else if (code === '3') {
          currentClasses.push('ansi-italic');
        } else if (code === '4') {
          currentClasses.push('ansi-underline');
        } else if (this.ansiColors[code]) {
          // Remove any existing color class
          currentClasses = currentClasses.filter(c => !c.startsWith('ansi-') || c.startsWith('ansi-bg-') || c.startsWith('ansi-bold') || c.startsWith('ansi-italic') || c.startsWith('ansi-underline'));
          currentClasses.push(this.ansiColors[code]);
        } else if (this.ansiBgColors[code]) {
          currentClasses = currentClasses.filter(c => !c.startsWith('ansi-bg-'));
          currentClasses.push(this.ansiBgColors[code]);
        }
      }

      lastIndex = match.index + match[0].length;
    }

    // Add remaining text
    if (lastIndex < text.length) {
      const remaining = escapeHtml(text.slice(lastIndex));
      if (currentClasses.length > 0) {
        result += `<span class="${currentClasses.join(' ')}">${remaining}</span>`;
      } else {
        result += remaining;
      }
    }

    return result || escapeHtml(text);
  }
}
