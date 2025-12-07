document.addEventListener('DOMContentLoaded', async () => {
  await customElements.whenDefined('terminal-window');
  const terminal = document.getElementById('terminal');

  // These commands are now handled by the VFS directly via enable-vfs attribute
  // terminal.registerCommand('ls', ...);
  // terminal.registerCommand('pwd', ...);
  // terminal.registerCommand('cat', ...);
  // terminal.registerCommand('cd', ...);
  // terminal.registerCommand('mkdir', ...);
  // terminal.registerCommand('touch', ...);
  // terminal.registerCommand('rm', ...);

terminal.registerCommand('whoami', () => 'user');

terminal.registerCommand('neofetch', () => `
    .--.          user@terminal
   |o_o |         -------------
   |:_/ |         OS: Terminal Window JS
  //   \\ \\        Host: Web Browser
 (|     | )       Kernel: JavaScript ES6+
/'\\_   _/\`\\       Shell: terminal-window
\\___)=(___/       Resolution: ${window.innerWidth}x${window.innerHeight}
                  Theme: ${terminal.config.theme}
                  Terminal: terminal-window v2.0.0
`);

// ANSI color demo command
terminal.registerCommand('colors', () => {
  return `
\x1b[1mANSI Color Support Demo\x1b[0m

Standard Colors:
\x1b[30m■ Black\x1b[0m   \x1b[31m■ Red\x1b[0m   \x1b[32m■ Green\x1b[0m   \x1b[33m■ Yellow\x1b[0m
\x1b[34m■ Blue\x1b[0m   \x1b[35m■ Magenta\x1b[0m   \x1b[36m■ Cyan\x1b[0m   \x1b[37m■ White\x1b[0m

Bright Colors:
\x1b[90m■ Bright Black\x1b[0m   \x1b[91m■ Bright Red\x1b[0m
\x1b[92m■ Bright Green\x1b[0m   \x1b[93m■ Bright Yellow\x1b[0m
\x1b[94m■ Bright Blue\x1b[0m   \x1b[95m■ Bright Magenta\x1b[0m
\x1b[96m■ Bright Cyan\x1b[0m   \x1b[97m■ Bright White\x1b[0m

Text Styles:
\x1b[1mBold text\x1b[0m   \x1b[3mItalic text\x1b[0m   \x1b[4mUnderlined text\x1b[0m

Combined: \x1b[1m\x1b[32mBold Green\x1b[0m \x1b[3m\x1b[34mItalic Blue\x1b[0m \x1b[1m\x1b[4m\x1b[31mBold Underlined Red\x1b[0m
`;
});

terminal.registerCommand('uname', (args) =>
  args.includes('-a') ? 'JavaScript Web 1.0.0 terminal-window ES6+ Browser x86_64' : 'JavaScript'
);

terminal.registerCommand('uptime', () => {
  const now = new Date();
  return ` ${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:00 up 42 days, 13:37, 1 user, load average: 0.42, 0.38, 0.35`;
});

terminal.registerCommand('cowsay', (args) => {
  const message = args.join(' ') || 'Moo!';
  const border = '-'.repeat(message.length + 2);
  return `
 ${border}
< ${message} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||
`;
});

terminal.registerCommand('fortune', () => {
  const fortunes = [
    'You will write bug-free code today... just kidding.',
    'A semicolon a day keeps the errors away.',
    'The best debugger is a good night\'s sleep.',
    'To understand recursion, you must first understand recursion.',
    'There are only 10 types of people: those who understand binary and those who don\'t.',
    'A programmer\'s wife tells him: "Go to the store and buy a loaf of bread. If they have eggs, buy a dozen." He returns with 12 loaves of bread.'
  ];
  return fortunes[Math.floor(Math.random() * fortunes.length)];
});

terminal.registerCommand('matrix', () => {
  let output = '';
  for (let i = 0; i < 10; i++) {
    let line = '';
    for (let j = 0; j < 60; j++) {
      line += Math.random() > 0.5 ? '1' : '0';
    }
    output += line + '\n';
  }
  return output;
});

terminal.registerCommand('weather', () => `
Weather: Sunny with a chance of commits

    \\   /      Temperature: 72°F (22°C)
     .-.       Humidity: 42%
  - (   ) -    Wind: 10 mph NW
     \`-'
    /   \\      "Perfect weather for coding!"
`);

terminal.registerCommand('figlet', (args) => {
  const text = args.join(' ') || 'Hello';
  const letters = {
    'H': ['|   |', '|---|', '|   |'],
    'E': ['|---', '|-- ', '|---'],
    'L': ['|   ', '|   ', '|___'],
    'O': [' -- ', '|  |', ' -- '],
    ' ': ['   ', '   ', '   ']
  };

  const lines = ['', '', ''];
  for (const char of text.toUpperCase()) {
    const letter = letters[char] || ['???', '???', '???'];
    for (let i = 0; i < 3; i++) {
      lines[i] += letter[i] + ' ';
    }
  }
  return lines.join('\n');
});

terminal.addEventListener('command', (e) => console.log('Command executed:', e.detail));
terminal.addEventListener('copy', (e) => console.log('Content copied:', e.detail.text.substring(0, 50) + '...'));

// Make runDemo available globally
window.runDemo = async function() {
  terminal.clear();
  terminal.setTypingEffect(true, 25);
  await terminal.executeSequence([
    { command: 'echo "Welcome to Terminal Window v2.0.0!"', delay: 1500 },
    { command: 'neofetch', delay: 2000 },
    { command: 'colors', delay: 2500 },
    { command: 'fortune', delay: 1500 },
    { command: 'cowsay "Demo complete!"', delay: 1000 },
  ]);
  terminal.setTypingEffect(false);
};

});
