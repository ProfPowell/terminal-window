/**
 * Unix Commands Module
 * Simulated Unix commands for educational purposes
 */

export function registerUnixCommands(terminal) {
  // Simulated file system
  const fs = {
    '/': { type: 'dir', children: ['home', 'var', 'etc', 'usr', 'tmp', 'bin'] },
    '/home': { type: 'dir', children: ['user'] },
    '/home/user': { type: 'dir', children: ['Documents', 'Downloads', 'Pictures', 'projects', '.bashrc', '.profile', 'README.md'] },
    '/home/user/Documents': { type: 'dir', children: ['notes.txt', 'report.pdf', 'data.csv'] },
    '/home/user/Downloads': { type: 'dir', children: ['archive.tar.gz', 'image.png', 'setup.sh'] },
    '/home/user/Pictures': { type: 'dir', children: ['photo1.jpg', 'photo2.jpg', 'screenshot.png'] },
    '/home/user/projects': { type: 'dir', children: ['webapp', 'scripts', 'README.md'] },
    '/home/user/projects/webapp': { type: 'dir', children: ['index.html', 'style.css', 'app.js', 'package.json'] },
    '/home/user/projects/scripts': { type: 'dir', children: ['backup.sh', 'deploy.sh', 'test.py'] },
    '/var': { type: 'dir', children: ['log', 'www', 'cache'] },
    '/var/log': { type: 'dir', children: ['syslog', 'auth.log', 'apache2'] },
    '/etc': { type: 'dir', children: ['passwd', 'hosts', 'fstab', 'ssh'] },
    '/usr': { type: 'dir', children: ['bin', 'lib', 'share', 'local'] },
    '/tmp': { type: 'dir', children: ['temp_file.txt'] },
    '/bin': { type: 'dir', children: ['bash', 'ls', 'cat', 'grep', 'sed', 'awk'] }
  };

  const files = {
    'README.md': '# Project\n\nThis is a sample project.\n\n## Installation\n\nnpm install\n\n## Usage\n\nnpm start',
    '.bashrc': '# ~/.bashrc\n\nexport PATH=$PATH:/usr/local/bin\nalias ll="ls -la"\nalias grep="grep --color=auto"\n\nPS1="\\u@\\h:\\w\\$ "',
    '.profile': '# ~/.profile\n\nif [ -f ~/.bashrc ]; then\n    source ~/.bashrc\nfi',
    'notes.txt': 'Meeting notes from Monday:\n- Discussed project timeline\n- Review code changes\n- Plan sprint tasks',
    'data.csv': 'name,age,city\nAlice,28,New York\nBob,34,Los Angeles\nCharlie,22,Chicago',
    'package.json': '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "main": "app.js",\n  "scripts": {\n    "start": "node app.js",\n    "test": "jest"\n  }\n}',
    'index.html': '<!DOCTYPE html>\n<html>\n<head>\n  <title>Web App</title>\n</head>\n<body>\n  <h1>Hello World</h1>\n</body>\n</html>',
    'app.js': 'const express = require("express");\nconst app = express();\n\napp.get("/", (req, res) => {\n  res.send("Hello World!");\n});\n\napp.listen(3000);',
    'backup.sh': '#!/bin/bash\n# Backup script\ntar -czvf backup_$(date +%Y%m%d).tar.gz /home/user/projects\necho "Backup complete"',
    'deploy.sh': '#!/bin/bash\n# Deploy script\nnpm run build\nrsync -avz dist/ server:/var/www/html/',
    'test.py': '#!/usr/bin/env python3\nimport unittest\n\nclass TestMath(unittest.TestCase):\n    def test_add(self):\n        self.assertEqual(1 + 1, 2)\n\nif __name__ == "__main__":\n    unittest.main()',
    '/etc/passwd': 'root:x:0:0:root:/root:/bin/bash\nuser:x:1000:1000:User:/home/user:/bin/bash\nnobody:x:65534:65534:nobody:/nonexistent:/usr/sbin/nologin',
    '/etc/hosts': '127.0.0.1\tlocalhost\n127.0.1.1\tlinux-pc\n::1\tlocalhost ip6-localhost',
    '/var/log/syslog': 'Dec  3 10:00:01 linux CRON[1234]: (root) CMD (   cd / && run-parts --report /etc/cron.hourly)\nDec  3 10:05:23 linux kernel: [12345.678] USB device connected\nDec  3 10:10:45 linux systemd[1]: Started Daily apt download activities.\nDec  3 10:15:00 linux sshd[5678]: Accepted publickey for user from 192.168.1.100\nDec  3 10:20:33 linux kernel: [12400.123] ERROR: disk read failure on sda1'
  };

  let currentDir = '/home/user';
  let env = {
    PATH: '/usr/local/bin:/usr/bin:/bin',
    HOME: '/home/user',
    USER: 'user',
    SHELL: '/bin/bash',
    PWD: '/home/user',
    TERM: 'xterm-256color'
  };

  // Helper functions
  const resolvePath = (path) => {
    if (!path || path === '~') return '/home/user';
    if (path.startsWith('~')) path = '/home/user' + path.slice(1);
    if (!path.startsWith('/')) path = currentDir + '/' + path;

    // Normalize path
    const parts = path.split('/').filter(p => p && p !== '.');
    const result = [];
    for (const part of parts) {
      if (part === '..') result.pop();
      else result.push(part);
    }
    return '/' + result.join('/');
  };

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + 'B';
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + 'K';
    if (bytes < 1024 * 1024 * 1024) return (bytes / 1024 / 1024).toFixed(1) + 'M';
    return (bytes / 1024 / 1024 / 1024).toFixed(1) + 'G';
  };

  const randomDate = () => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    return `${months[Math.floor(Math.random() * 12)]} ${Math.floor(Math.random() * 28) + 1} ${Math.floor(Math.random() * 24).toString().padStart(2, '0')}:${Math.floor(Math.random() * 60).toString().padStart(2, '0')}`;
  };

  // ===== FILE SYSTEM NAVIGATION =====

  terminal.registerCommand('pwd', () => currentDir);

  terminal.registerCommand('ls', (args) => {
    const showAll = args.includes('-a') || args.includes('-la') || args.includes('-al');
    const longFormat = args.includes('-l') || args.includes('-la') || args.includes('-al') || args.includes('-lh');
    const humanReadable = args.includes('-h') || args.includes('-lh');

    const path = args.find(a => !a.startsWith('-')) || currentDir;
    const resolved = resolvePath(path);
    const dir = fs[resolved];

    if (!dir) return `ls: cannot access '${path}': No such file or directory`;
    if (dir.type !== 'dir') return path;

    let items = [...dir.children];
    if (showAll) items = ['.', '..', ...items];

    if (longFormat) {
      const lines = showAll ? [`total ${items.length * 4}`] : [];
      items.forEach(item => {
        const isDir = item === '.' || item === '..' || (fs[resolved + '/' + item]?.type === 'dir');
        const perms = isDir ? 'drwxr-xr-x' : (item.endsWith('.sh') ? '-rwxr-xr-x' : '-rw-r--r--');
        const size = isDir ? 4096 : Math.floor(Math.random() * 10000) + 100;
        const sizeStr = humanReadable ? formatSize(size).padStart(5) : size.toString().padStart(8);
        lines.push(`${perms}  1 user user ${sizeStr} ${randomDate()} ${item}${isDir && item !== '.' && item !== '..' ? '/' : ''}`);
      });
      return lines.join('\n');
    }

    return items.map(i => {
      const isDir = i === '.' || i === '..' || (fs[resolved + '/' + i]?.type === 'dir');
      return isDir ? i + '/' : i;
    }).join('  ');
  });

  terminal.registerCommand('cd', (args) => {
    const path = args[0] || '~';
    const resolved = resolvePath(path);

    if (!fs[resolved]) return `cd: ${path}: No such file or directory`;
    if (fs[resolved].type !== 'dir') return `cd: ${path}: Not a directory`;

    currentDir = resolved;
    env.PWD = currentDir;
    return null;
  });

  terminal.registerCommand('tree', (args) => {
    const path = resolvePath(args[0] || currentDir);
    const dir = fs[path];
    if (!dir || dir.type !== 'dir') return `tree: ${args[0] || '.'}: No such directory`;

    const buildTree = (dirPath, prefix = '') => {
      const d = fs[dirPath];
      if (!d || !d.children) return [];

      const lines = [];
      d.children.forEach((item, i) => {
        const isLast = i === d.children.length - 1;
        const connector = isLast ? '└── ' : '├── ';
        const childPath = dirPath + '/' + item;
        const isDir = fs[childPath]?.type === 'dir';
        lines.push(prefix + connector + item + (isDir ? '/' : ''));

        if (isDir) {
          const newPrefix = prefix + (isLast ? '    ' : '│   ');
          lines.push(...buildTree(childPath, newPrefix));
        }
      });
      return lines;
    };

    const name = path.split('/').pop() || '/';
    return [name + '/', ...buildTree(path)].join('\n');
  });

  // ===== FILE OPERATIONS =====

  terminal.registerCommand('cat', (args) => {
    if (args.length === 0) return 'Usage: cat <file> [...files]';

    return args.filter(a => !a.startsWith('-')).map(file => {
      if (files[file]) return files[file];
      const resolved = resolvePath(file);
      const name = resolved.split('/').pop();
      if (files[name]) return files[name];
      if (files[resolved]) return files[resolved];
      return `cat: ${file}: No such file or directory`;
    }).join('\n');
  });

  terminal.registerCommand('head', (args) => {
    let lines = 10;
    const nIndex = args.indexOf('-n');
    if (nIndex !== -1 && args[nIndex + 1]) {
      lines = parseInt(args[nIndex + 1]) || 10;
    }

    const file = args.find(a => !a.startsWith('-') && isNaN(a));
    if (!file) return 'Usage: head [-n lines] <file>';

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `head: ${file}: No such file or directory`;

    return content.split('\n').slice(0, lines).join('\n');
  });

  terminal.registerCommand('tail', (args) => {
    let lines = 10;
    const nIndex = args.indexOf('-n');
    if (nIndex !== -1 && args[nIndex + 1]) {
      lines = parseInt(args[nIndex + 1]) || 10;
    }

    const file = args.find(a => !a.startsWith('-') && isNaN(a));
    if (!file) return 'Usage: tail [-n lines] <file>';

    if (args.includes('-f')) {
      return `tail: watching '${file}' for changes... (Ctrl+C to stop)\n` +
             `[Simulated: In real usage, this would show live updates]`;
    }

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `tail: ${file}: No such file or directory`;

    const allLines = content.split('\n');
    return allLines.slice(-lines).join('\n');
  });

  terminal.registerCommand('less', (args) => {
    if (args.length === 0) return 'Usage: less <file>';
    const content = files[args[0]] || files[resolvePath(args[0])];
    if (!content) return `less: ${args[0]}: No such file or directory`;
    return content + '\n\n(END) - Press q to quit, space for next page';
  });

  terminal.registerCommand('wc', (args) => {
    const file = args.find(a => !a.startsWith('-'));
    if (!file) return 'Usage: wc <file>';

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `wc: ${file}: No such file or directory`;

    const lines = content.split('\n').length;
    const words = content.split(/\s+/).filter(w => w).length;
    const chars = content.length;

    if (args.includes('-l')) return `${lines} ${file}`;
    if (args.includes('-w')) return `${words} ${file}`;
    if (args.includes('-c')) return `${chars} ${file}`;

    return `  ${lines}   ${words}  ${chars} ${file}`;
  });

  terminal.registerCommand('file', (args) => {
    if (args.length === 0) return 'Usage: file <file>';
    const file = args[0];

    if (file.endsWith('.txt')) return `${file}: ASCII text`;
    if (file.endsWith('.md')) return `${file}: UTF-8 Unicode text`;
    if (file.endsWith('.sh')) return `${file}: Bourne-Again shell script, ASCII text executable`;
    if (file.endsWith('.py')) return `${file}: Python script, ASCII text executable`;
    if (file.endsWith('.js')) return `${file}: JavaScript source, ASCII text`;
    if (file.endsWith('.json')) return `${file}: JSON data`;
    if (file.endsWith('.html')) return `${file}: HTML document, UTF-8 Unicode text`;
    if (file.endsWith('.css')) return `${file}: CSS stylesheet, ASCII text`;
    if (file.endsWith('.tar.gz')) return `${file}: gzip compressed data, from Unix`;
    if (file.endsWith('.png')) return `${file}: PNG image data, 1920 x 1080, 8-bit/color RGBA`;
    if (file.endsWith('.jpg')) return `${file}: JPEG image data, JFIF standard`;
    if (file.endsWith('.pdf')) return `${file}: PDF document, version 1.4`;

    return `${file}: data`;
  });

  terminal.registerCommand('touch', (args) => {
    if (args.length === 0) return 'touch: missing file operand';
    return null; // Simulate success
  });

  terminal.registerCommand('mkdir', (args) => {
    if (args.length === 0) return 'mkdir: missing operand';
    if (args.includes('-p')) return null; // Create parent directories
    return null;
  });

  terminal.registerCommand('cp', (args) => {
    if (args.length < 2) return 'cp: missing destination file operand';
    const recursive = args.includes('-r') || args.includes('-R');
    return null;
  });

  terminal.registerCommand('mv', (args) => {
    if (args.length < 2) return 'mv: missing destination file operand';
    return null;
  });

  terminal.registerCommand('rm', (args) => {
    if (args.length === 0) return 'rm: missing operand';
    if (args.includes('-rf') && (args.includes('/') || args.includes('/*'))) {
      return 'rm: it is dangerous to operate recursively on root\nrm: use --no-preserve-root to override this failsafe';
    }
    return null;
  });

  terminal.registerCommand('rmdir', (args) => {
    if (args.length === 0) return 'rmdir: missing operand';
    return null;
  });

  terminal.registerCommand('ln', (args) => {
    if (args.length < 2) return 'ln: missing file operand';
    const symbolic = args.includes('-s');
    return null;
  });

  // ===== TEXT PROCESSING =====

  terminal.registerCommand('grep', (args) => {
    const ignoreCase = args.includes('-i');
    const recursive = args.includes('-r') || args.includes('-R');
    const showLineNum = args.includes('-n');

    const pattern = args.find(a => !a.startsWith('-'));
    const file = args.filter(a => !a.startsWith('-'))[1];

    if (!pattern) return 'Usage: grep [options] pattern [file]';

    let content = '';
    if (file) {
      content = files[file] || files[resolvePath(file)] || '';
    } else if (recursive) {
      content = Object.entries(files).map(([k, v]) =>
        v.split('\n').map((line, i) => `${k}:${i + 1}:${line}`).join('\n')
      ).join('\n');
    }

    if (!content) return `grep: ${file}: No such file or directory`;

    const regex = new RegExp(pattern, ignoreCase ? 'gi' : 'g');
    const matches = content.split('\n').filter(line => regex.test(line));

    if (matches.length === 0) return '';

    if (showLineNum && file) {
      return content.split('\n')
        .map((line, i) => regex.test(line) ? `${i + 1}:${line}` : null)
        .filter(Boolean)
        .join('\n');
    }

    return matches.join('\n');
  });

  terminal.registerCommand('sed', (args) => {
    if (args.length < 2) return 'Usage: sed "s/pattern/replacement/g" file';
    return '[Simulated: sed would transform the file content]\nExample output with replacements applied.';
  });

  terminal.registerCommand('awk', (args) => {
    if (args.length < 2) return 'Usage: awk \'{print $1}\' file';

    const file = args[args.length - 1];
    const content = files[file] || files[resolvePath(file)];

    if (!content) return `awk: ${file}: No such file or directory`;

    // Simple simulation - print first column
    return content.split('\n').map(line => line.split(/\s+/)[0]).join('\n');
  });

  terminal.registerCommand('sort', (args) => {
    const reverse = args.includes('-r');
    const numeric = args.includes('-n');
    const unique = args.includes('-u');

    const file = args.find(a => !a.startsWith('-'));
    if (!file) return 'Usage: sort [options] file';

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `sort: ${file}: No such file or directory`;

    let lines = content.split('\n');

    if (numeric) {
      lines.sort((a, b) => parseFloat(a) - parseFloat(b));
    } else {
      lines.sort();
    }

    if (reverse) lines.reverse();
    if (unique) lines = [...new Set(lines)];

    return lines.join('\n');
  });

  terminal.registerCommand('uniq', (args) => {
    const count = args.includes('-c');
    const file = args.find(a => !a.startsWith('-'));

    if (!file) return 'Usage: uniq [options] file';

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `uniq: ${file}: No such file or directory`;

    const lines = content.split('\n');
    const result = [];
    let prev = null;
    let cnt = 0;

    for (const line of lines) {
      if (line === prev) {
        cnt++;
      } else {
        if (prev !== null) {
          result.push(count ? `   ${cnt} ${prev}` : prev);
        }
        prev = line;
        cnt = 1;
      }
    }
    if (prev !== null) {
      result.push(count ? `   ${cnt} ${prev}` : prev);
    }

    return result.join('\n');
  });

  terminal.registerCommand('cut', (args) => {
    const dIndex = args.indexOf('-d');
    const fIndex = args.indexOf('-f');

    const delimiter = dIndex !== -1 ? args[dIndex + 1] : '\t';
    const field = fIndex !== -1 ? parseInt(args[fIndex + 1]) : 1;
    const file = args[args.length - 1];

    const content = files[file] || files[resolvePath(file)];
    if (!content) return `cut: ${file}: No such file or directory`;

    return content.split('\n').map(line => {
      const parts = line.split(delimiter === ':' ? ':' : delimiter);
      return parts[field - 1] || '';
    }).join('\n');
  });

  terminal.registerCommand('tr', (args) => {
    if (args.length < 2) return 'Usage: tr set1 set2 < input';
    return '[Simulated: tr would translate characters]\nTRANSFORMED OUTPUT';
  });

  // ===== FILE SEARCH =====

  terminal.registerCommand('find', (args) => {
    const path = args[0] || '.';
    const nameIdx = args.indexOf('-name');
    const typeIdx = args.indexOf('-type');

    let results = [
      './Documents',
      './Documents/notes.txt',
      './Documents/report.pdf',
      './Downloads',
      './Downloads/archive.tar.gz',
      './projects',
      './projects/webapp',
      './projects/webapp/index.html',
      './projects/webapp/app.js',
      './projects/scripts',
      './projects/scripts/backup.sh',
      './README.md'
    ];

    if (nameIdx !== -1 && args[nameIdx + 1]) {
      const pattern = args[nameIdx + 1].replace(/\*/g, '.*').replace(/"/g, '');
      const regex = new RegExp(pattern);
      results = results.filter(r => regex.test(r));
    }

    if (typeIdx !== -1) {
      if (args[typeIdx + 1] === 'f') {
        results = results.filter(r => r.includes('.'));
      } else if (args[typeIdx + 1] === 'd') {
        results = results.filter(r => !r.includes('.') || r.endsWith('/'));
      }
    }

    return results.join('\n');
  });

  terminal.registerCommand('locate', (args) => {
    if (args.length === 0) return 'Usage: locate pattern';
    return `/home/user/${args[0]}\n/usr/share/${args[0]}\n/var/lib/${args[0]}`;
  });

  terminal.registerCommand('which', (args) => {
    if (args.length === 0) return 'Usage: which command';
    const binaries = ['bash', 'ls', 'cat', 'grep', 'sed', 'awk', 'python', 'node', 'git'];
    if (binaries.includes(args[0])) return `/usr/bin/${args[0]}`;
    return `which: no ${args[0]} in (${env.PATH})`;
  });

  terminal.registerCommand('whereis', (args) => {
    if (args.length === 0) return 'Usage: whereis command';
    return `${args[0]}: /usr/bin/${args[0]} /usr/share/man/man1/${args[0]}.1.gz`;
  });

  // ===== PERMISSIONS =====

  terminal.registerCommand('chmod', (args) => {
    if (args.length < 2) return 'chmod: missing operand';
    return null;
  });

  terminal.registerCommand('chown', (args) => {
    if (args.length < 2) return 'chown: missing operand';
    return null;
  });

  terminal.registerCommand('chgrp', (args) => {
    if (args.length < 2) return 'chgrp: missing operand';
    return null;
  });

  terminal.registerCommand('umask', (args) => {
    if (args.length === 0) return '0022';
    return null;
  });

  terminal.registerCommand('stat', (args) => {
    if (args.length === 0) return 'stat: missing operand';
    const file = args[0];
    return `  File: ${file}
  Size: ${Math.floor(Math.random() * 10000)}\tBlocks: 8\tIO Block: 4096\tregular file
Device: 801h/2049d\tInode: ${Math.floor(Math.random() * 1000000)}\tLinks: 1
Access: (0644/-rw-r--r--)\tUid: ( 1000/   user)\tGid: ( 1000/   user)
Access: 2024-12-03 10:30:00.000000000 -0500
Modify: 2024-12-02 15:45:30.000000000 -0500
Change: 2024-12-02 15:45:30.000000000 -0500
 Birth: -`;
  });

  // ===== SYSTEM INFORMATION =====

  terminal.registerCommand('uname', (args) => {
    if (args.includes('-a')) {
      return 'Linux linux-pc 5.15.0-generic #1 SMP x86_64 x86_64 x86_64 GNU/Linux';
    }
    if (args.includes('-r')) return '5.15.0-generic';
    if (args.includes('-m')) return 'x86_64';
    if (args.includes('-s')) return 'Linux';
    return 'Linux';
  });

  terminal.registerCommand('hostname', () => 'linux-pc');

  terminal.registerCommand('uptime', () => {
    const now = new Date();
    const h = now.getHours().toString().padStart(2, '0');
    const m = now.getMinutes().toString().padStart(2, '0');
    return ` ${h}:${m}:00 up 42 days, 13:37,  1 user,  load average: 0.42, 0.38, 0.35`;
  });

  terminal.registerCommand('whoami', () => 'user');

  terminal.registerCommand('id', () => 'uid=1000(user) gid=1000(user) groups=1000(user),4(adm),24(cdrom),27(sudo),30(dip)');

  terminal.registerCommand('cal', () => {
    const now = new Date();
    const month = now.toLocaleString('en-US', { month: 'long' });
    const year = now.getFullYear();
    return `    ${month} ${year}
Su Mo Tu We Th Fr Sa
                1  2
 3  4  5  6  7  8  9
10 11 12 13 14 15 16
17 18 19 20 21 22 23
24 25 26 27 28 29 30
31`;
  });

  terminal.registerCommand('df', (args) => {
    const human = args.includes('-h');
    if (human) {
      return `Filesystem      Size  Used Avail Use% Mounted on
/dev/sda1       100G   45G   50G  48% /
tmpfs           3.9G  1.2M  3.9G   1% /dev/shm
/dev/sda2       500G  200G  275G  42% /home`;
    }
    return `Filesystem     1K-blocks     Used Available Use% Mounted on
/dev/sda1      104857600 47185920  52428800  48% /
tmpfs            4046844     1228   4045616   1% /dev/shm
/dev/sda2      524288000 209715200 288358400  42% /home`;
  });

  terminal.registerCommand('du', (args) => {
    const summary = args.includes('-s');
    const human = args.includes('-h');

    if (summary && human) {
      return `4.2G\t.`;
    }

    return `4.0K\t./Documents
8.0K\t./Downloads
12K\t./Pictures
24K\t./projects/webapp
16K\t./projects/scripts
48K\t./projects
76K\t.`;
  });

  terminal.registerCommand('free', (args) => {
    const human = args.includes('-h');
    if (human) {
      return `              total        used        free      shared  buff/cache   available
Mem:           7.7G        2.1G        3.2G        256M        2.4G        5.1G
Swap:          2.0G          0B        2.0G`;
    }
    return `              total        used        free      shared  buff/cache   available
Mem:        8046844     2202516     3358612      262144     2485716     5365424
Swap:       2097148           0     2097148`;
  });

  terminal.registerCommand('lscpu', () => `Architecture:            x86_64
CPU op-mode(s):          32-bit, 64-bit
Byte Order:              Little Endian
CPU(s):                  8
Thread(s) per core:      2
Core(s) per socket:      4
Socket(s):               1
Model name:              Intel(R) Core(TM) i7-8650U CPU @ 1.90GHz
CPU MHz:                 2100.000
L1d cache:               128 KiB
L1i cache:               128 KiB
L2 cache:                1 MiB
L3 cache:                8 MiB`);

  terminal.registerCommand('lsblk', () => `NAME   MAJ:MIN RM   SIZE RO TYPE MOUNTPOINT
sda      8:0    0   600G  0 disk
├─sda1   8:1    0   100G  0 part /
├─sda2   8:2    0   500G  0 part /home
sdb      8:16   0    32G  0 disk
└─sdb1   8:17   0    32G  0 part /mnt/usb`);

  // ===== PROCESS MANAGEMENT =====

  terminal.registerCommand('ps', (args) => {
    if (args.includes('aux')) {
      return `USER       PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root         1  0.0  0.1  22532  4892 ?        Ss   Dec01   0:03 /sbin/init
root         2  0.0  0.0      0     0 ?        S    Dec01   0:00 [kthreadd]
user      1234  0.5  1.2 987654 48000 ?        Sl   10:00   0:15 /usr/bin/node app.js
user      2345  0.2  0.8 654321 32000 pts/0    S+   10:30   0:02 vim README.md
user      3456  0.0  0.1  12345  4000 pts/1    R+   11:00   0:00 ps aux`;
    }
    return `  PID TTY          TIME CMD
 1234 pts/0    00:00:15 node
 2345 pts/0    00:00:02 vim
 3456 pts/1    00:00:00 ps`;
  });

  terminal.registerCommand('top', () => `top - 11:00:00 up 42 days, 13:37,  1 user,  load average: 0.42, 0.38, 0.35
Tasks: 185 total,   1 running, 184 sleeping,   0 stopped,   0 zombie
%Cpu(s):  5.2 us,  1.3 sy,  0.0 ni, 93.0 id,  0.5 wa,  0.0 hi,  0.0 si
MiB Mem :   7858.2 total,   3283.4 free,   2150.8 used,   2424.0 buff/cache
MiB Swap:   2048.0 total,   2048.0 free,      0.0 used.   5234.2 avail Mem

  PID USER      PR  NI    VIRT    RES    SHR S  %CPU  %MEM     TIME+ COMMAND
 1234 user      20   0  987654  48000  12000 S   5.0   0.6   0:15.23 node
 2345 user      20   0  654321  32000   8000 S   2.0   0.4   0:02.45 vim
    1 root      20   0   22532   4892   3456 S   0.0   0.1   0:03.12 init

[Press q to quit - this is a simulation]`);

  terminal.registerCommand('htop', () => `[htop simulation - Interactive process viewer]

  CPU[||||||||                    25.0%]   Tasks: 185, 1 running
  Mem[||||||||||||||              1.8G/7.7G]
  Swp[                            0K/2.0G]

  PID USER      PRI  NI  VIRT   RES   SHR S CPU% MEM%   TIME+  Command
 1234 user       20   0  987M  48.0M  12.0M S  5.0  0.6  0:15.23 node app.js
 2345 user       20   0  654M  32.0M   8.0M S  2.0  0.4  0:02.45 vim README.md

[Press F10 to quit - this is a simulation]`);

  terminal.registerCommand('kill', (args) => {
    if (args.length === 0) return 'kill: usage: kill [-s sigspec | -n signum | -sigspec] pid | jobspec ...';
    return null;
  });

  terminal.registerCommand('killall', (args) => {
    if (args.length === 0) return 'killall: no process selection criteria specified';
    return null;
  });

  terminal.registerCommand('pkill', (args) => {
    if (args.length === 0) return 'pkill: no matching criteria specified';
    return null;
  });

  terminal.registerCommand('pgrep', (args) => {
    if (args.length === 0) return 'pgrep: no matching criteria specified';
    return '1234\n5678';
  });

  terminal.registerCommand('bg', () => '[1]+ node app.js &');
  terminal.registerCommand('fg', () => 'node app.js');
  terminal.registerCommand('jobs', () => '[1]+  Running                 node app.js &');

  terminal.registerCommand('nohup', (args) => {
    if (args.length === 0) return 'nohup: missing command';
    return 'nohup: appending output to nohup.out';
  });

  // ===== NETWORKING =====

  terminal.registerCommand('ping', (args) => {
    if (args.length === 0) return 'ping: usage: ping destination';
    const host = args[0];
    return `PING ${host} (93.184.216.34): 56 data bytes
64 bytes from 93.184.216.34: icmp_seq=0 ttl=56 time=12.3 ms
64 bytes from 93.184.216.34: icmp_seq=1 ttl=56 time=11.8 ms
64 bytes from 93.184.216.34: icmp_seq=2 ttl=56 time=12.1 ms
^C
--- ${host} ping statistics ---
3 packets transmitted, 3 packets received, 0.0% packet loss
round-trip min/avg/max/stddev = 11.8/12.1/12.3/0.2 ms`;
  });

  terminal.registerCommand('ifconfig', () => `eth0: flags=4163<UP,BROADCAST,RUNNING,MULTICAST>  mtu 1500
        inet 192.168.1.100  netmask 255.255.255.0  broadcast 192.168.1.255
        inet6 fe80::1  prefixlen 64  scopeid 0x20<link>
        ether 00:1a:2b:3c:4d:5e  txqueuelen 1000  (Ethernet)
        RX packets 123456  bytes 98765432 (94.1 MiB)
        TX packets 65432  bytes 12345678 (11.7 MiB)

lo: flags=73<UP,LOOPBACK,RUNNING>  mtu 65536
        inet 127.0.0.1  netmask 255.0.0.0
        inet6 ::1  prefixlen 128  scopeid 0x10<host>`);

  terminal.registerCommand('ip', (args) => {
    if (args[0] === 'addr' || args[0] === 'a') {
      return `1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536
    inet 127.0.0.1/8 scope host lo
2: eth0: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500
    inet 192.168.1.100/24 brd 192.168.1.255 scope global eth0`;
    }
    return 'Usage: ip [ OPTIONS ] OBJECT { COMMAND }';
  });

  terminal.registerCommand('netstat', (args) => {
    return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      1234/sshd
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      5678/nginx
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      5678/nginx
tcp        0      0 127.0.0.1:3306          0.0.0.0:*               LISTEN      9012/mysqld`;
  });

  terminal.registerCommand('ss', (args) => {
    return `Netid  State   Recv-Q  Send-Q   Local Address:Port    Peer Address:Port
tcp    LISTEN  0       128      0.0.0.0:22           0.0.0.0:*
tcp    LISTEN  0       511      0.0.0.0:80           0.0.0.0:*
tcp    LISTEN  0       511      0.0.0.0:443          0.0.0.0:*
tcp    ESTAB   0       0        192.168.1.100:22     192.168.1.50:54321`;
  });

  terminal.registerCommand('nslookup', (args) => {
    if (args.length === 0) return 'Usage: nslookup hostname';
    return `Server:    8.8.8.8
Address:   8.8.8.8#53

Non-authoritative answer:
Name:    ${args[0]}
Address: 93.184.216.34`;
  });

  terminal.registerCommand('dig', (args) => {
    if (args.length === 0) return 'Usage: dig hostname';
    return `; <<>> DiG 9.16.1 <<>> ${args[0]}
;; ANSWER SECTION:
${args[0]}.          300     IN      A       93.184.216.34

;; Query time: 23 msec
;; SERVER: 8.8.8.8#53(8.8.8.8)`;
  });

  terminal.registerCommand('traceroute', (args) => {
    if (args.length === 0) return 'Usage: traceroute hostname';
    return `traceroute to ${args[0]} (93.184.216.34), 30 hops max
 1  gateway (192.168.1.1)  1.234 ms
 2  isp-router (10.0.0.1)  5.678 ms
 3  core-router (172.16.0.1)  12.345 ms
 4  ${args[0]} (93.184.216.34)  23.456 ms`;
  });

  terminal.registerCommand('wget', (args) => {
    if (args.length === 0) return 'Usage: wget [URL]';
    return `--2024-12-03 11:00:00--  ${args[0]}
Resolving ${args[0]}... 93.184.216.34
Connecting to ${args[0]}|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1256 (1.2K) [text/html]
Saving to: 'index.html'

index.html          100%[===================>]   1.23K  --.-KB/s    in 0s

2024-12-03 11:00:01 (12.3 MB/s) - 'index.html' saved [1256/1256]`;
  });

  terminal.registerCommand('curl', (args) => {
    if (args.length === 0) return 'curl: try \'curl --help\' for more information';
    return `<!DOCTYPE html>
<html>
<head><title>Example</title></head>
<body><h1>Hello from ${args[0]}</h1></body>
</html>`;
  });

  terminal.registerCommand('ssh', (args) => {
    if (args.length === 0) return 'usage: ssh user@hostname';
    return `The authenticity of host '${args[0]}' can't be established.
ED25519 key fingerprint is SHA256:xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx.
Are you sure you want to continue connecting (yes/no)?
[Simulated: SSH connection would be established]`;
  });

  terminal.registerCommand('scp', (args) => {
    if (args.length < 2) return 'usage: scp source destination';
    return `file.txt                     100%  1234     1.2KB/s   00:01`;
  });

  // ===== COMPRESSION =====

  terminal.registerCommand('tar', (args) => {
    if (args.length === 0) return 'tar: You must specify one of the \'-Acdtrux\' options';

    if (args.includes('-c')) {
      return `file1.txt\nfile2.txt\ndir/\ndir/file3.txt`;
    }
    if (args.includes('-t')) {
      return `file1.txt\nfile2.txt\ndir/\ndir/file3.txt`;
    }
    if (args.includes('-x')) {
      return null; // Silent extraction
    }
    return null;
  });

  terminal.registerCommand('gzip', (args) => {
    if (args.length === 0) return 'gzip: compressed data not read from a terminal';
    return null;
  });

  terminal.registerCommand('gunzip', (args) => {
    if (args.length === 0) return 'gunzip: compressed data not read from a terminal';
    return null;
  });

  terminal.registerCommand('zip', (args) => {
    if (args.length < 2) return 'zip: missing file arguments';
    return `  adding: ${args[args.length - 1]} (deflated 60%)`;
  });

  terminal.registerCommand('unzip', (args) => {
    if (args.length === 0) return 'unzip: missing archive';
    return `Archive:  ${args[0]}
   creating: extracted/
  inflating: extracted/file1.txt
  inflating: extracted/file2.txt`;
  });

  // ===== USER MANAGEMENT =====

  terminal.registerCommand('sudo', (args) => {
    if (args.length === 0) return 'usage: sudo command';
    return `[sudo] password for user:
[Simulated: Command would execute with elevated privileges]`;
  });

  terminal.registerCommand('su', (args) => `Password:
[Simulated: Would switch to ${args[0] || 'root'} user]`);

  terminal.registerCommand('useradd', (args) => {
    if (args.length === 0) return 'useradd: missing operand';
    return null;
  });

  terminal.registerCommand('userdel', (args) => {
    if (args.length === 0) return 'userdel: missing operand';
    return null;
  });

  terminal.registerCommand('usermod', (args) => {
    if (args.length === 0) return 'usermod: missing operand';
    return null;
  });

  terminal.registerCommand('passwd', () => `Changing password for user.
Current password:
New password:
Retype new password:
passwd: password updated successfully`);

  terminal.registerCommand('groupadd', (args) => {
    if (args.length === 0) return 'groupadd: missing operand';
    return null;
  });

  terminal.registerCommand('groups', () => 'user adm cdrom sudo dip plugdev');

  terminal.registerCommand('visudo', () => '[Simulated: Would open sudoers file in editor]');

  // ===== PACKAGE MANAGEMENT =====

  terminal.registerCommand('apt', (args) => {
    if (args.length === 0) return 'apt: missing command';

    if (args[0] === 'update') {
      return `Hit:1 http://archive.ubuntu.com/ubuntu jammy InRelease
Get:2 http://security.ubuntu.com/ubuntu jammy-security InRelease [110 kB]
Reading package lists... Done
Building dependency tree... Done`;
    }

    if (args[0] === 'upgrade') {
      return `Reading package lists... Done
Building dependency tree... Done
The following packages will be upgraded:
  package1 package2 package3
3 upgraded, 0 newly installed, 0 to remove.
Do you want to continue? [Y/n]`;
    }

    if (args[0] === 'install') {
      return `Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  ${args[1] || 'package'}
0 upgraded, 1 newly installed, 0 to remove.
Do you want to continue? [Y/n]`;
    }

    if (args[0] === 'search') {
      return `Sorting... Done
Full Text Search... Done
${args[1] || 'package'}/jammy 1.0.0 amd64
  Description of ${args[1] || 'package'}`;
    }

    return 'apt: invalid operation';
  });

  terminal.registerCommand('dpkg', (args) => {
    if (args.length === 0) return 'dpkg: missing operand';
    if (args[0] === '-i') {
      return `Selecting previously unselected package.
(Reading database ... 150000 files and directories currently installed.)
Preparing to unpack ${args[1]}...
Unpacking package...
Setting up package...`;
    }
    return 'dpkg: unknown option';
  });

  terminal.registerCommand('yum', (args) => {
    if (args.length === 0) return 'You need to give some command';
    return `Loaded plugins: fastestmirror
Loading mirror speeds from cached hostfile
Resolving Dependencies
--> Running transaction check
[Simulated: yum operation would proceed]`;
  });

  terminal.registerCommand('dnf', (args) => {
    if (args.length === 0) return 'usage: dnf <command>';
    return `Last metadata expiration check: 0:42:00 ago
[Simulated: dnf operation would proceed]`;
  });

  // ===== ENVIRONMENT =====

  terminal.registerCommand('env', () => {
    return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
  });

  terminal.registerCommand('printenv', (args) => {
    if (args.length === 0) {
      return Object.entries(env).map(([k, v]) => `${k}=${v}`).join('\n');
    }
    return env[args[0]] || '';
  });

  terminal.registerCommand('export', (args) => {
    if (args.length === 0) {
      return Object.entries(env).map(([k, v]) => `declare -x ${k}="${v}"`).join('\n');
    }
    return null;
  });

  terminal.registerCommand('alias', (args) => {
    if (args.length === 0) {
      return `alias ll='ls -la'
alias grep='grep --color=auto'
alias ..='cd ..'`;
    }
    return null;
  });

  terminal.registerCommand('source', () => null);

  // ===== FUN COMMANDS =====

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
      'You will find a hidden treasure today... in the form of knowledge.',
      'The command line is mightier than the GUI.',
      'A wise programmer once said: "Have you tried turning it off and on again?"',
      'Your code will compile on the first try... just kidding.',
      'Today is a good day to learn a new command.',
      'The answer you seek is in the man pages.',
      'sudo make me a sandwich',
      'There are 10 types of people: those who understand binary and those who don\'t.',
      'To understand recursion, you must first understand recursion.',
      'Debugging is like being a detective in a crime movie where you are also the murderer.'
    ];
    return fortunes[Math.floor(Math.random() * fortunes.length)];
  });

  terminal.registerCommand('figlet', (args) => {
    const text = (args.join(' ') || 'UNIX').toUpperCase();
    const font = {
      'U': ['|   |', '|   |', ' \\_/ '],
      'N': ['|\\  |', '| \\ |', '|  \\|'],
      'I': ['===', ' | ', '==='],
      'X': ['\\   /', ' \\ / ', ' / \\ '],
      'L': ['|   ', '|   ', '|___'],
      'E': ['|---', '|-- ', '|---'],
      'H': ['|   |', '|---|', '|   |'],
      'O': [' --- ', '|   |', ' --- '],
      ' ': ['   ', '   ', '   ']
    };

    const lines = ['', '', ''];
    for (const char of text) {
      const letter = font[char] || ['???', '???', '???'];
      for (let i = 0; i < 3; i++) {
        lines[i] += letter[i] + ' ';
      }
    }
    return lines.join('\n');
  });

  terminal.registerCommand('matrix', () => {
    let output = '';
    for (let i = 0; i < 15; i++) {
      let line = '';
      for (let j = 0; j < 60; j++) {
        line += Math.random() > 0.5 ? '1' : '0';
      }
      output += line + '\n';
    }
    return output;
  });

  terminal.registerCommand('sl', () => `
                         (@@) (  ) (@)  ( )  @@    ()    @     O     @
                    (   )
                (@@@@)
             (    )

           (@@@)
       ====        ________                ___________
   _D _|  |_______/        \\__I_I_____===__|_________|
    |(_)---  |   H\\________/ |   |        =|___ ___|
    /     |  |   H  |  |     |   |         ||_| |_||
   |      |  |   H  |__--------------------| [___] |
   | ________|___H__/__|_____/[][]~\\_______|       |
   |/ |   |-----------I_____I [][] []  D   |=======|_
 __/ =| o |=-~~\\  /~~\\  /~~\\  /~~\\ ____Y___________|__
|/-=|___|=    ||    ||    ||    |_____/~\\___/
 \\_/      \\O=====O=====O=====O_/      \\_/

You have been hit by a steam locomotive!`);

  terminal.registerCommand('cmatrix', () => `[cmatrix simulation]

  01001110 01101111 00100000 01101111 01101110
  01100101 00100000 01100011 01100001 01101110
  00100000 01100010 01100101 00100000 01110100
  01101111 01101100 01100100 00100000 01110111
  01101000 01100001 01110100 00100000 01110100
  01101000 01100101 00100000 01001101 01100001
  01110100 01110010 01101001 01111000 00100000

[Press Ctrl+C to exit - this is a simulation]`);

  terminal.registerCommand('neofetch', () => `
        .--.            user@linux-pc
       |o_o |           --------------
       |:_/ |           OS: Ubuntu 22.04 LTS x86_64
      //   \\ \\          Host: Virtual Machine
     (|     | )         Kernel: 5.15.0-generic
    /'\\_   _/\`\\         Uptime: 42 days, 13 hours
    \\___)=(___/         Packages: 1234 (dpkg)
                        Shell: bash 5.1.8
                        Terminal: terminal-window
                        CPU: Intel i7-8650U (8) @ 2.1GHz
                        Memory: 2150MiB / 7858MiB
`);

  // Override help for Unix demo
  terminal.registerCommand('help', () => {
    return `Unix Command Trainer - Available Commands

FILE SYSTEM:     ls, cd, pwd, tree, mkdir, touch, cp, mv, rm, ln
FILE VIEWING:    cat, less, head, tail, wc, file
TEXT PROCESSING: grep, sed, awk, sort, uniq, cut, tr
SEARCH:          find, locate, which, whereis
PERMISSIONS:     chmod, chown, chgrp, umask, stat
SYSTEM INFO:     uname, hostname, uptime, whoami, id, date, cal, df, du, free
PROCESSES:       ps, top, htop, kill, killall, pkill, pgrep, jobs, bg, fg
NETWORKING:      ping, ifconfig, ip, netstat, ss, nslookup, dig, traceroute
COMPRESSION:     tar, gzip, gunzip, zip, unzip
USERS:           sudo, su, useradd, userdel, passwd, groups
PACKAGES:        apt, dpkg, yum, dnf
ENVIRONMENT:     env, printenv, export, alias, source, history

Type any command to see simulated output. Click commands in the sidebar for quick access.`;
  });
}
