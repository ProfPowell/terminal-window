/**
 * Hello World Commands Module
 * Fun and basic commands to demonstrate terminal-window features
 */

export function registerHelloCommands(terminal) {
  // Cowsay - ASCII art cow with speech bubble
  terminal.registerCommand('cowsay', (args) => {
    const message = args.join(' ') || 'Hello, World!';
    const border = '-'.repeat(message.length + 2);
    return `
 ${border}
< ${message} >
 ${border}
        \\   ^__^
         \\  (oo)\\_______
            (__)\\       )\\/\\
                ||----w |
                ||     ||`;
  });

  // Figlet - Large ASCII text
  terminal.registerCommand('figlet', (args) => {
    const text = args.join(' ') || 'Hello';
    // Simple block letters
    const letters = {
      'H': ['#   #', '#   #', '#####', '#   #', '#   #'],
      'E': ['#####', '#    ', '#### ', '#    ', '#####'],
      'L': ['#    ', '#    ', '#    ', '#    ', '#####'],
      'O': [' ### ', '#   #', '#   #', '#   #', ' ### '],
      'W': ['#   #', '#   #', '# # #', '## ##', '#   #'],
      'R': ['#### ', '#   #', '#### ', '#  # ', '#   #'],
      'D': ['#### ', '#   #', '#   #', '#   #', '#### '],
      'I': ['#####', '  #  ', '  #  ', '  #  ', '#####'],
      ' ': ['     ', '     ', '     ', '     ', '     '],
      '!': ['  #  ', '  #  ', '  #  ', '     ', '  #  ']
    };

    const upper = text.toUpperCase();
    const lines = ['', '', '', '', ''];
    for (const char of upper) {
      const pattern = letters[char] || letters[' '];
      for (let i = 0; i < 5; i++) {
        lines[i] += pattern[i] + '  ';
      }
    }
    return lines.join('\n');
  });

  // Fortune - Random quotes
  terminal.registerCommand('fortune', () => {
    const fortunes = [
      "The best way to predict the future is to invent it. - Alan Kay",
      "Talk is cheap. Show me the code. - Linus Torvalds",
      "Any sufficiently advanced technology is indistinguishable from magic. - Arthur C. Clarke",
      "First, solve the problem. Then, write the code. - John Johnson",
      "Code is like humor. When you have to explain it, it's bad. - Cory House",
      "Simplicity is the soul of efficiency. - Austin Freeman",
      "Make it work, make it right, make it fast. - Kent Beck",
      "The only way to learn a new programming language is by writing programs in it. - Dennis Ritchie"
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  });

  // Echo with color support
  terminal.registerCommand('echo', (args) => {
    return args.join(' ');
  });

  // Color demo
  terminal.registerCommand('colors', () => {
    return `\x1b[31mRed\x1b[0m \x1b[32mGreen\x1b[0m \x1b[33mYellow\x1b[0m \x1b[34mBlue\x1b[0m \x1b[35mMagenta\x1b[0m \x1b[36mCyan\x1b[0m

\x1b[1mBold text\x1b[0m
\x1b[3mItalic text\x1b[0m
\x1b[4mUnderlined text\x1b[0m
\x1b[1;32mBold Green\x1b[0m
\x1b[1;34mBold Blue\x1b[0m

Background colors:
\x1b[41m Red BG \x1b[0m \x1b[42m Green BG \x1b[0m \x1b[44m Blue BG \x1b[0m`;
  });

  // Date command
  terminal.registerCommand('date', () => {
    return new Date().toString();
  });

  // Whoami
  terminal.registerCommand('whoami', () => {
    return 'demo-user';
  });

  // Clear screen
  terminal.registerCommand('clear', () => {
    terminal.clear();
    return '';
  });

  // Simple calculator
  terminal.registerCommand('calc', (args) => {
    const expr = args.join('');
    if (!expr) return 'Usage: calc <expression>\nExample: calc 2+2';
    try {
      // Only allow safe math operations
      if (!/^[\d\s+\-*/().]+$/.test(expr)) {
        return 'Error: Invalid expression';
      }
      const result = Function('"use strict"; return (' + expr + ')')();
      return `${expr} = ${result}`;
    } catch {
      return 'Error: Invalid expression';
    }
  });

  // Countdown timer demo - updates in place using updateLastLine
  terminal.registerCommand('countdown', async (args) => {
    const seconds = parseInt(args[0]) || 5;
    if (seconds > 10) return 'Maximum countdown is 10 seconds';

    const width = seconds;
    terminal.print(`\x1b[33m  ${seconds}  \x1b[0m[${'░'.repeat(width)}]`);

    for (let i = seconds; i > 0; i--) {
      await new Promise(r => setTimeout(r, 1000));
      const filled = seconds - i + 1;
      const bar = '█'.repeat(filled) + '░'.repeat(Math.max(0, width - filled));
      terminal.updateLastLine(`\x1b[33m  ${i}  \x1b[0m[${bar}]`);
    }

    await new Promise(r => setTimeout(r, 500));
    terminal.updateLastLine('\x1b[32m  🎉 Blast off! 🚀\x1b[0m');
    return '';
  });

  // Matrix rain effect (simplified)
  terminal.registerCommand('matrix', async () => {
    const chars = 'ﾊﾐﾋｰｳｼﾅﾓﾆｻﾜﾂｵﾘｱﾎﾃﾏｹﾒｴｶｷﾑﾕﾗｾﾈｽﾀﾇﾍ01234567890';
    terminal.print('\x1b[32m>>> Entering the Matrix...\x1b[0m');
    await new Promise(r => setTimeout(r, 500));

    for (let i = 0; i < 8; i++) {
      let line = '';
      for (let j = 0; j < 50; j++) {
        line += chars[Math.floor(Math.random() * chars.length)];
      }
      terminal.print(`\x1b[32m${line}\x1b[0m`);
      await new Promise(r => setTimeout(r, 150));
    }
    return '\x1b[32m>>> Wake up, Neo...\x1b[0m';
  });

  // Banner/ASCII art
  terminal.registerCommand('banner', () => {
    return `
╔═══════════════════════════════════════════════════════════════════════╗
║                                                                       ║
║  ████████╗███████╗██████╗ ███╗   ███╗██╗███╗   ██╗ █████╗ ██╗         ║
║  ╚══██╔══╝██╔════╝██╔══██╗████╗ ████║██║████╗  ██║██╔══██╗██║         ║
║     ██║   █████╗  ██████╔╝██╔████╔██║██║██╔██╗ ██║███████║██║         ║
║     ██║   ██╔══╝  ██╔══██╗██║╚██╔╝██║██║██║╚██╗██║██╔══██║██║         ║
║     ██║   ███████╗██║  ██║██║ ╚═╝ ██║██║██║ ╚████║██║  ██║███████╗    ║
║     ╚═╝   ╚══════╝╚═╝  ╚═╝╚═╝     ╚═╝╚═╝╚═╝  ╚═══╝╚═╝  ╚═╝╚══════╝    ║
║                                                                       ║
║                    Welcome to Terminal Window!                        ║
║                                                                       ║
╚═══════════════════════════════════════════════════════════════════════╝`;
  });

  // Typing effect demo - demonstrates the built-in typing effect
  terminal.registerCommand('typing', async () => {
    // Enable typing effect temporarily
    terminal.setTypingEffect(true, 25);

    await terminal.print('\x1b[36mThis text is being typed character by character...\x1b[0m');
    await terminal.print('');
    await terminal.print('The terminal-window component has a built-in typing effect!');
    await terminal.print('Enable it with the \x1b[33mtyping-effect\x1b[0m attribute:');
    await terminal.print('');
    await terminal.print('  <terminal-window \x1b[32mtyping-effect\x1b[0m typing-speed="30">');

    // Disable typing effect
    terminal.setTypingEffect(false);

    return '\x1b[32m✓ Typing demo complete!\x1b[0m';
  });

  // Progress bar demo - updates in place using updateLastLine
  terminal.registerCommand('progress', async () => {
    const width = 20;

    terminal.print('\x1b[36mDownloading update...\x1b[0m');
    terminal.print(`  [\x1b[100m${' '.repeat(width)}\x1b[0m] 0%`);

    for (let percent = 0; percent <= 100; percent += 5) {
      await new Promise(r => setTimeout(r, 100));
      const filled = Math.round((percent / 100) * width);
      const bar = '\x1b[42m' + ' '.repeat(filled) + '\x1b[0m\x1b[100m' + ' '.repeat(width - filled) + '\x1b[0m';
      terminal.updateLastLine(`  [${bar}] ${percent}%`);
    }

    await new Promise(r => setTimeout(r, 300));
    return '\x1b[32m✓ Download complete!\x1b[0m';
  });

  // Joke command
  terminal.registerCommand('joke', () => {
    const jokes = [
      "Why do programmers prefer dark mode?\nBecause light attracts bugs!",
      "A SQL query walks into a bar, walks up to two tables and asks...\n'Can I join you?'",
      "Why do Java developers wear glasses?\nBecause they can't C#!",
      "There are only 10 types of people in the world:\nThose who understand binary and those who don't.",
      "What's a programmer's favorite hangout place?\nFoo Bar!",
      "Why was the JavaScript developer sad?\nBecause he didn't Node how to Express himself!"
    ];
    return jokes[Math.floor(Math.random() * jokes.length)];
  });

  // System info (simulated)
  terminal.registerCommand('neofetch', () => {
    return `\x1b[34m
       _,met$$$$$gg.          \x1b[0mdemo-user\x1b[34m@\x1b[0mterminal
    ,g$$$$$$$$$$$$$$$P.       \x1b[34m-----------------\x1b[0m
  ,g$$P"     """Y$$.".        \x1b[34mOS:\x1b[0m Terminal Window Demo
 ,$$P'              \`$$$.     \x1b[34mHost:\x1b[0m Web Browser
',$$P       ,ggs.     \`$$b:   \x1b[34mKernel:\x1b[0m JavaScript ES2024
\`d$$'     ,$P"'   .    $$$    \x1b[34mUptime:\x1b[0m ${Math.floor(Math.random() * 60)} mins
 $$P      d$'     ,    $$P    \x1b[34mShell:\x1b[0m terminal-window
 $$:      $$.   -    ,d$$'    \x1b[34mTerminal:\x1b[0m <terminal-window>
 $$;      Y$b._   _,d$P'      \x1b[34mCPU:\x1b[0m Your Browser Engine
 Y$$.    \`.\`"Y$$$$P"'         \x1b[34mMemory:\x1b[0m Unlimited
 \`$$b      "-.__
  \`Y$$                        \x1b[41m   \x1b[42m   \x1b[43m   \x1b[44m   \x1b[45m   \x1b[46m   \x1b[47m   \x1b[0m
   \`Y$$.
     \`$$b.
       \`Y$$b.
          \`"Y$b._
              \`"""
\x1b[0m`;
  });

  // Help command
  terminal.registerCommand('help', () => {
    return `\x1b[1mAvailable Commands:\x1b[0m

\x1b[33mFun & ASCII Art:\x1b[0m
  cowsay <msg>    Display message with ASCII cow
  figlet <text>   Large ASCII text banner
  fortune         Random programming quote
  joke            Random programming joke
  banner          Display welcome banner
  neofetch        System info (simulated)
  matrix          Matrix rain effect

\x1b[33mFeature Demos:\x1b[0m
  colors          Show ANSI color support
  typing          Learn about typing effect
  progress        Animated progress bar
  countdown [n]   Countdown timer (max 10s)

\x1b[33mUtilities:\x1b[0m
  echo <text>     Print text
  calc <expr>     Simple calculator
  date            Show current date/time
  whoami          Show current user
  clear           Clear the screen
  help            Show this help message

\x1b[36mTip: Try 'cowsay Hello World!' or 'figlet HI'\x1b[0m`;
  });
}
