/**
 * Git Commands Module
 * Simulated git commands for educational purposes
 */

function registerGitCommands(terminal) {
  // Simulated repository state
  const repo = {
    branch: 'main',
    branches: ['main', 'develop', 'feature/auth', 'feature/api'],
    remotes: {
      origin: 'https://github.com/user/repo.git'
    },
    staged: [],
    modified: ['README.md', 'src/app.js'],
    untracked: ['temp.log', 'notes.txt'],
    stashes: [],
    tags: ['v1.0.0', 'v1.1.0', 'v2.0.0-beta'],
    commits: [
      { hash: 'a1b2c3d', message: 'Add user authentication', author: 'John Doe', date: '2024-12-02' },
      { hash: 'e4f5g6h', message: 'Fix login bug', author: 'Jane Smith', date: '2024-12-01' },
      { hash: 'i7j8k9l', message: 'Update dependencies', author: 'John Doe', date: '2024-11-30' },
      { hash: 'm1n2o3p', message: 'Add API endpoints', author: 'Bob Wilson', date: '2024-11-29' },
      { hash: 'q4r5s6t', message: 'Initial commit', author: 'John Doe', date: '2024-11-28' }
    ],
    config: {
      'user.name': 'Your Name',
      'user.email': 'you@example.com',
      'core.editor': 'vim',
      'init.defaultBranch': 'main'
    }
  };

  const randomHash = () => Math.random().toString(16).substr(2, 7);

  // git init
  terminal.registerCommand('git', (args) => {
    if (args.length === 0) {
      return `usage: git [--version] [--help] <command> [<args>]

These are common Git commands used in various situations:

start a working area
   clone     Clone a repository into a new directory
   init      Create an empty Git repository

work on the current change
   add       Add file contents to the index
   restore   Restore working tree files

examine the history and state
   diff      Show changes between commits
   log       Show commit logs
   status    Show the working tree status

grow, mark and tweak your common history
   branch    List, create, or delete branches
   commit    Record changes to the repository
   merge     Join two or more development histories
   rebase    Reapply commits on top of another base
   tag       Create, list, delete or verify tags

collaborate
   fetch     Download objects and refs from another repository
   pull      Fetch from and integrate with another repository
   push      Update remote refs along with associated objects

'git help -a' and 'git help -g' list available subcommands`;
    }

    const cmd = args[0];
    const subArgs = args.slice(1);

    switch (cmd) {
      case 'init':
        return `Initialized empty Git repository in /home/user/project/.git/`;

      case 'clone':
        if (subArgs.length === 0) return 'usage: git clone <repository>';
        const repoUrl = subArgs[0];
        const repoName = repoUrl.split('/').pop().replace('.git', '');
        const depth = subArgs.includes('--depth') ? ` (depth ${subArgs[subArgs.indexOf('--depth') + 1]})` : '';
        return `Cloning into '${repoName}'...
remote: Enumerating objects: 156, done.
remote: Counting objects: 100% (156/156), done.
remote: Compressing objects: 100% (98/98), done.
remote: Total 156 (delta 45), reused 134 (delta 32)
Receiving objects: 100% (156/156), 45.23 KiB | 1.23 MiB/s, done.
Resolving deltas: 100% (45/45), done.${depth}`;

      case 'status':
        let status = `On branch ${repo.branch}\n`;
        if (repo.staged.length > 0) {
          status += `\nChanges to be committed:\n  (use "git restore --staged <file>..." to unstage)\n`;
          repo.staged.forEach(f => status += `\t\x1b[32mmodified:   ${f}\x1b[0m\n`);
        }
        if (repo.modified.length > 0) {
          status += `\nChanges not staged for commit:\n  (use "git add <file>..." to update what will be committed)\n`;
          repo.modified.forEach(f => status += `\t\x1b[31mmodified:   ${f}\x1b[0m\n`);
        }
        if (repo.untracked.length > 0) {
          status += `\nUntracked files:\n  (use "git add <file>..." to include in what will be committed)\n`;
          repo.untracked.forEach(f => status += `\t\x1b[31m${f}\x1b[0m\n`);
        }
        if (repo.staged.length === 0 && repo.modified.length === 0 && repo.untracked.length === 0) {
          status += '\nnothing to commit, working tree clean';
        }
        return status;

      case 'add':
        if (subArgs.length === 0) return 'Nothing specified, nothing added.';
        if (subArgs[0] === '.' || subArgs[0] === '-A') {
          repo.staged = [...repo.modified, ...repo.untracked];
          repo.modified = [];
          repo.untracked = [];
        } else if (subArgs[0] === '-p') {
          return `diff --git a/README.md b/README.md
@@ -1,3 +1,4 @@
 # Project
+
+Added new section

(1/1) Stage this hunk [y,n,q,a,d,e,?]? `;
        }
        return null;

      case 'commit':
        if (!subArgs.includes('-m') && !subArgs.includes('--amend')) {
          return 'Aborting commit due to empty commit message.';
        }
        const msgIndex = subArgs.indexOf('-m');
        const message = msgIndex !== -1 ? subArgs[msgIndex + 1] : 'Amended commit';
        const hash = randomHash();
        const isAmend = subArgs.includes('--amend');

        if (subArgs.includes('-a') || subArgs.includes('-am')) {
          repo.staged = [...repo.modified];
          repo.modified = [];
        }

        repo.commits.unshift({
          hash,
          message: message?.replace(/"/g, '') || 'No message',
          author: repo.config['user.name'],
          date: new Date().toISOString().split('T')[0]
        });
        repo.staged = [];

        return `[${repo.branch} ${hash}] ${message?.replace(/"/g, '')}
 2 files changed, 15 insertions(+), 3 deletions(-)`;

      case 'push':
        const force = subArgs.includes('--force') || subArgs.includes('-f');
        const forceWithLease = subArgs.includes('--force-with-lease');
        const upstream = subArgs.includes('-u');
        const remote = subArgs.find(a => !a.startsWith('-')) || 'origin';
        const pushBranch = subArgs.filter(a => !a.startsWith('-'))[1] || repo.branch;

        if (force) {
          return `Total 0 (delta 0), reused 0 (delta 0)
To ${repo.remotes.origin}
 + a1b2c3d...${randomHash()} ${pushBranch} -> ${pushBranch} (forced update)`;
        }

        return `Enumerating objects: 5, done.
Counting objects: 100% (5/5), done.
Delta compression using up to 8 threads
Compressing objects: 100% (3/3), done.
Writing objects: 100% (3/3), 312 bytes | 312.00 KiB/s, done.
Total 3 (delta 2), reused 0 (delta 0)
remote: Resolving deltas: 100% (2/2), completed with 2 local objects.
To ${repo.remotes.origin}
   a1b2c3d..${randomHash()}  ${pushBranch} -> ${pushBranch}${upstream ? `\nBranch '${pushBranch}' set up to track remote branch '${pushBranch}' from '${remote}'.` : ''}`;

      case 'pull':
        const pullRemote = subArgs.find(a => !a.startsWith('-')) || 'origin';
        const pullBranch = subArgs.filter(a => !a.startsWith('-'))[1] || repo.branch;
        const rebase = subArgs.includes('--rebase');

        return `remote: Enumerating objects: 3, done.
remote: Counting objects: 100% (3/3), done.
remote: Compressing objects: 100% (2/2), done.
remote: Total 3 (delta 1), reused 0 (delta 0)
Unpacking objects: 100% (3/3), 298 bytes | 298.00 KiB/s, done.
From ${repo.remotes.origin}
   a1b2c3d..e4f5g6h  ${pullBranch}     -> ${pullRemote}/${pullBranch}
${rebase ? 'Successfully rebased and updated' : 'Updating a1b2c3d..e4f5g6h\nFast-forward'}
 README.md | 2 ++
 1 file changed, 2 insertions(+)`;

      case 'fetch':
        const fetchRemote = subArgs.find(a => !a.startsWith('-')) || 'origin';
        const fetchAll = subArgs.includes('--all');

        return `remote: Enumerating objects: 10, done.
remote: Counting objects: 100% (10/10), done.
remote: Compressing objects: 100% (6/6), done.
remote: Total 10 (delta 4), reused 8 (delta 2)
Unpacking objects: 100% (10/10), done.
From ${repo.remotes.origin}
   a1b2c3d..e4f5g6h  main       -> ${fetchRemote}/main
 * [new branch]      feature    -> ${fetchRemote}/feature`;

      case 'branch':
        if (subArgs.length === 0) {
          return repo.branches.map(b => b === repo.branch ? `* \x1b[32m${b}\x1b[0m` : `  ${b}`).join('\n');
        }
        if (subArgs[0] === '-a') {
          let output = repo.branches.map(b => b === repo.branch ? `* \x1b[32m${b}\x1b[0m` : `  ${b}`).join('\n');
          output += `\n  \x1b[31mremotes/origin/main\x1b[0m`;
          output += `\n  \x1b[31mremotes/origin/develop\x1b[0m`;
          return output;
        }
        if (subArgs[0] === '-d' || subArgs[0] === '-D') {
          const branchToDelete = subArgs[1];
          if (branchToDelete === repo.branch) return `error: Cannot delete branch '${branchToDelete}' checked out`;
          return `Deleted branch ${branchToDelete} (was ${randomHash()}).`;
        }
        if (subArgs[0] === '-m') {
          return `Branch renamed to '${subArgs[2] || subArgs[1]}'`;
        }
        const newBranch = subArgs[0];
        repo.branches.push(newBranch);
        return null;

      case 'checkout':
        if (subArgs.length === 0) return 'error: switch requires a branch name';
        if (subArgs[0] === '-b') {
          const branchName = subArgs[1];
          repo.branches.push(branchName);
          repo.branch = branchName;
          return `Switched to a new branch '${branchName}'`;
        }
        if (subArgs[0] === '--') {
          return null; // Discard changes
        }
        if (subArgs[0].startsWith('HEAD@{')) {
          return `Note: checking out 'HEAD@{2}'.
You are in 'detached HEAD' state.`;
        }
        if (repo.branches.includes(subArgs[0])) {
          repo.branch = subArgs[0];
          return `Switched to branch '${subArgs[0]}'`;
        }
        return `error: pathspec '${subArgs[0]}' did not match any file(s) known to git`;

      case 'switch':
        if (subArgs.length === 0) return 'fatal: missing branch or commit argument';
        if (subArgs[0] === '-c') {
          const branchName = subArgs[1];
          repo.branches.push(branchName);
          repo.branch = branchName;
          return `Switched to a new branch '${branchName}'`;
        }
        if (repo.branches.includes(subArgs[0])) {
          repo.branch = subArgs[0];
          return `Switched to branch '${subArgs[0]}'`;
        }
        return `fatal: invalid reference: ${subArgs[0]}`;

      case 'merge':
        if (subArgs.length === 0) return 'error: No branch specified';
        if (subArgs[0] === '--abort') return 'Merge aborted.';
        const mergeBranch = subArgs[0];
        const noFf = subArgs.includes('--no-ff');
        const squash = subArgs.includes('--squash');

        if (squash) {
          return `Squash commit -- not updating HEAD
Automatic merge went well; stopped before committing as requested`;
        }

        return `${noFf ? 'Merge made by the \'recursive\' strategy.' : 'Updating a1b2c3d..e4f5g6h\nFast-forward'}
 src/feature.js | 45 +++++++++++++++++++++++++++++++++++++++++++++
 1 file changed, 45 insertions(+)
 create mode 100644 src/feature.js`;

      case 'rebase':
        if (subArgs.length === 0) return 'error: No rebase in progress?';
        if (subArgs[0] === '--continue') return 'Successfully rebased and updated refs/heads/feature.';
        if (subArgs[0] === '--abort') return 'Rebase aborted.';
        if (subArgs[0] === '--skip') return 'Skipped commit and continuing rebase...';
        if (subArgs[0] === '-i') {
          return `pick a1b2c3d Add user authentication
pick e4f5g6h Fix login bug
pick i7j8k9l Update dependencies

# Rebase m1n2o3p..i7j8k9l onto m1n2o3p (3 commands)
#
# Commands:
# p, pick = use commit
# r, reword = use commit, but edit the commit message
# e, edit = use commit, but stop for amending
# s, squash = use commit, but meld into previous commit
# f, fixup = like "squash", but discard this commit's log message
# d, drop = remove commit`;
        }
        return `Successfully rebased and updated refs/heads/${repo.branch}.`;

      case 'log':
        const oneline = subArgs.includes('--oneline');
        const graph = subArgs.includes('--graph');
        const limit = subArgs.find(a => a.startsWith('-') && !isNaN(a.slice(1)));
        const count = limit ? parseInt(limit.slice(1)) : 5;
        const authorFilter = subArgs.find(a => a.startsWith('--author='));
        const grepFilter = subArgs.find(a => a.startsWith('--grep='));

        let commits = repo.commits.slice(0, count);

        if (authorFilter) {
          const author = authorFilter.split('=')[1].replace(/"/g, '');
          commits = commits.filter(c => c.author.toLowerCase().includes(author.toLowerCase()));
        }

        if (grepFilter) {
          const pattern = grepFilter.split('=')[1].replace(/"/g, '');
          commits = commits.filter(c => c.message.toLowerCase().includes(pattern.toLowerCase()));
        }

        if (oneline) {
          const prefix = graph ? '* ' : '';
          return commits.map(c => `${prefix}\x1b[33m${c.hash}\x1b[0m ${c.message}`).join('\n');
        }

        return commits.map(c => `\x1b[33mcommit ${c.hash}${'0'.repeat(33)}\x1b[0m
Author: ${c.author} <${c.author.toLowerCase().replace(' ', '.')}@example.com>
Date:   ${c.date}

    ${c.message}
`).join('\n');

      case 'diff':
        if (subArgs.includes('--staged') || subArgs.includes('--cached')) {
          return `diff --git a/src/app.js b/src/app.js
index a1b2c3d..e4f5g6h 100644
--- a/src/app.js
+++ b/src/app.js
@@ -10,6 +10,8 @@ function init() {
   console.log('Initializing...');
+  // New feature added
+  loadFeature();
 }`;
        }

        return `diff --git a/README.md b/README.md
index 1234567..abcdefg 100644
--- a/README.md
+++ b/README.md
@@ -1,5 +1,7 @@
 # Project

+## New Section
+
 This is the project description.

-Old text here
+Updated text here`;

      case 'show':
        const showRef = subArgs[0] || 'HEAD';
        const commit = repo.commits[0];
        return `\x1b[33mcommit ${commit.hash}${'0'.repeat(33)}\x1b[0m
Author: ${commit.author} <${commit.author.toLowerCase().replace(' ', '.')}@example.com>
Date:   ${commit.date}

    ${commit.message}

diff --git a/src/app.js b/src/app.js
index a1b2c3d..e4f5g6h 100644
--- a/src/app.js
+++ b/src/app.js
@@ -1,3 +1,5 @@
+// New code
 function main() {
   console.log('Hello');
 }`;

      case 'blame':
        if (subArgs.length === 0) return 'usage: git blame <file>';
        return `a1b2c3d4 (John Doe  2024-12-02 10:00:00 +0000  1) # Project
e4f5g6h8 (Jane Smith 2024-12-01 15:30:00 +0000  2)
i7j8k9l0 (John Doe  2024-11-30 09:15:00 +0000  3) ## Description
m1n2o3p4 (Bob Wilson 2024-11-29 14:45:00 +0000  4)
q4r5s6t8 (John Doe  2024-11-28 11:00:00 +0000  5) This is the project.`;

      case 'stash':
        if (subArgs.length === 0 || subArgs[0] === 'push') {
          const msg = subArgs.includes('-m') ? subArgs[subArgs.indexOf('-m') + 1] : `WIP on ${repo.branch}`;
          repo.stashes.unshift({ id: repo.stashes.length, message: msg });
          return `Saved working directory and index state ${msg}`;
        }
        if (subArgs[0] === 'list') {
          if (repo.stashes.length === 0) return '';
          return repo.stashes.map((s, i) => `stash@{${i}}: ${s.message}`).join('\n');
        }
        if (subArgs[0] === 'pop') {
          if (repo.stashes.length === 0) return 'No stash entries found.';
          const stash = repo.stashes.shift();
          return `Dropped refs/stash@{0} (${randomHash()})`;
        }
        if (subArgs[0] === 'apply') {
          if (repo.stashes.length === 0) return 'No stash entries found.';
          return `Applied stash@{0}`;
        }
        if (subArgs[0] === 'drop') {
          if (repo.stashes.length === 0) return 'No stash entries found.';
          repo.stashes.shift();
          return `Dropped refs/stash@{0}`;
        }
        if (subArgs[0] === 'clear') {
          repo.stashes = [];
          return null;
        }
        if (subArgs[0] === 'show') {
          return ` README.md | 2 ++
 1 file changed, 2 insertions(+)`;
        }
        return 'usage: git stash [push | pop | list | show | drop | clear]';

      case 'tag':
        if (subArgs.length === 0) {
          return repo.tags.join('\n');
        }
        if (subArgs[0] === '-d') {
          return `Deleted tag '${subArgs[1]}' (was ${randomHash()})`;
        }
        if (subArgs[0] === '-a') {
          const tagName = subArgs[1];
          repo.tags.push(tagName);
          return null;
        }
        const tagName = subArgs[0];
        repo.tags.push(tagName);
        return null;

      case 'remote':
        if (subArgs.length === 0 || subArgs[0] === '-v') {
          return Object.entries(repo.remotes).map(([name, url]) =>
            `${name}\t${url} (fetch)\n${name}\t${url} (push)`
          ).join('\n');
        }
        if (subArgs[0] === 'add') {
          repo.remotes[subArgs[1]] = subArgs[2];
          return null;
        }
        if (subArgs[0] === 'remove' || subArgs[0] === 'rm') {
          delete repo.remotes[subArgs[1]];
          return null;
        }
        return 'usage: git remote [-v | add | remove]';

      case 'reset':
        const resetMode = subArgs.includes('--hard') ? 'hard' : subArgs.includes('--soft') ? 'soft' : 'mixed';
        const resetRef = subArgs.find(a => !a.startsWith('-')) || 'HEAD';

        if (resetMode === 'hard') {
          repo.staged = [];
          repo.modified = [];
          return `HEAD is now at ${repo.commits[0].hash} ${repo.commits[0].message}`;
        }
        return `Unstaged changes after reset:
M\tREADME.md
M\tsrc/app.js`;

      case 'revert':
        return `[${repo.branch} ${randomHash()}] Revert "${repo.commits[0].message}"
 1 file changed, 3 deletions(-)`;

      case 'restore':
        if (subArgs.includes('--staged')) {
          return null; // Unstage
        }
        return null; // Discard changes

      case 'cherry-pick':
        if (subArgs.length === 0) return 'usage: git cherry-pick <commit>';
        if (subArgs[0] === '--abort') return null;
        if (subArgs[0] === '--continue') return null;
        return `[${repo.branch} ${randomHash()}] ${repo.commits[0].message}
 Date: ${new Date().toISOString()}
 1 file changed, 5 insertions(+)`;

      case 'bisect':
        if (subArgs[0] === 'start') return 'Bisecting: 8 revisions left to test after this';
        if (subArgs[0] === 'bad') return 'Bisecting: 4 revisions left to test after this';
        if (subArgs[0] === 'good') return 'Bisecting: 2 revisions left to test after this';
        if (subArgs[0] === 'reset') return 'Previous HEAD position was a1b2c3d...';
        if (subArgs[0] === 'skip') return 'Bisecting: 1 revision left to test after this';
        return 'usage: git bisect [start | bad | good | reset | skip]';

      case 'reflog':
        const reflogBranch = subArgs.find(a => a.startsWith('show')) ? subArgs[1] : null;
        return `${randomHash()} HEAD@{0}: commit: ${repo.commits[0].message}
${randomHash()} HEAD@{1}: checkout: moving from feature to main
${randomHash()} HEAD@{2}: commit: Previous commit
${randomHash()} HEAD@{3}: pull: Fast-forward
${randomHash()} HEAD@{4}: commit: Another commit`;

      case 'clean':
        if (subArgs.includes('-n')) {
          return `Would remove temp.log\nWould remove notes.txt`;
        }
        if (subArgs.includes('-f')) {
          repo.untracked = [];
          return `Removing temp.log\nRemoving notes.txt`;
        }
        return 'usage: git clean [-n] [-f] [-d]';

      case 'config':
        if (subArgs[0] === '--list') {
          return Object.entries(repo.config).map(([k, v]) => `${k}=${v}`).join('\n');
        }
        if (subArgs.includes('--global')) {
          const key = subArgs.find(a => !a.startsWith('-') && a.includes('.'));
          const value = subArgs[subArgs.length - 1];
          if (key && value && key !== value) {
            repo.config[key] = value;
          }
          return null;
        }
        return 'usage: git config [--global] <key> [value]';

      case 'submodule':
        if (subArgs[0] === 'add') {
          return `Cloning into 'lib'...
done.`;
        }
        if (subArgs[0] === 'init') {
          return `Submodule 'lib' registered for path 'lib'`;
        }
        if (subArgs[0] === 'update') {
          return `Cloning into 'lib'...
Submodule path 'lib': checked out 'abc1234'`;
        }
        if (subArgs[0] === 'status') {
          return ` abc1234 lib (v1.0.0)`;
        }
        return 'usage: git submodule [add | init | update | status]';

      case 'worktree':
        if (subArgs[0] === 'list') {
          return `/home/user/project      abc1234 [main]
/home/user/project-fix  def5678 [hotfix]`;
        }
        if (subArgs[0] === 'add') {
          return `Preparing worktree (new branch '${subArgs[2] || 'worktree'}')
HEAD is now at ${randomHash()}`;
        }
        if (subArgs[0] === 'remove') {
          return null;
        }
        if (subArgs[0] === 'prune') {
          return null;
        }
        return 'usage: git worktree [list | add | remove | prune]';

      case 'grep':
        if (subArgs.length === 0) return 'usage: git grep <pattern>';
        const pattern = subArgs.find(a => !a.startsWith('-'));
        const showLineNums = subArgs.includes('-n');
        const prefix = showLineNums ? ':10:' : ':';
        return `src/app.js${prefix}  // ${pattern} found here
src/utils.js${prefix}  const ${pattern} = true;
README.md${prefix}  ${pattern} documentation`;

      case 'mergetool':
        return `Merging:
README.md

Normal merge conflict for 'README.md':
  {local}: modified file
  {remote}: modified file
Hit return to start merge resolution tool (vimdiff):`;

      default:
        return `git: '${cmd}' is not a git command. See 'git --help'.`;
    }
  });

  // Help command
  terminal.registerCommand('help', () => {
    return `Git Tutorial - Available Commands

GETTING STARTED:
  git init                  Create new repository
  git clone <url>           Clone a repository
  git config                Configure Git settings

BASIC WORKFLOW:
  git status                Show working tree status
  git add <file>            Stage changes
  git commit -m "msg"       Commit changes
  git push                  Push to remote

BRANCHING:
  git branch                List/create branches
  git checkout <branch>     Switch branches
  git merge <branch>        Merge branches
  git rebase <branch>       Rebase onto branch

HISTORY:
  git log                   View commit history
  git diff                  Show changes
  git blame <file>          Show who changed what

REMOTE:
  git remote -v             List remotes
  git fetch                 Download from remote
  git pull                  Fetch and merge

UNDOING:
  git reset                 Unstage/reset changes
  git revert                Revert a commit
  git stash                 Temporarily save changes

Click commands in the sidebar to see them in action!`;
  });
}
