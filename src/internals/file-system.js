/**
 * Virtual File System (VFS)
 * A simple in-memory file system structure and operations
 */
export class VirtualFileSystem {
  constructor() {
    // Root directory structure
    this.root = {
      type: 'dir',
      name: '/',
      children: new Map(),
      parent: null
    };
    
    // Current working directory (pointer to a directory object)
    this.cwd = this.root;
    
    // Current path string (for display/quick access)
    this.currentPath = '/';
    
    // Initialize default structure
    this._initDefaultStructure();
  }

  /**
   * Initialize default file system structure
   */
  _initDefaultStructure() {
    this.mkdir('/home');
    this.mkdir('/home/user');
    this.mkdir('/bin');
    this.mkdir('/etc');
    this.mkdir('/tmp');
    this.mkdir('/var');
    
    // Set default user directory
    this.cwd = this.resolvePathObject('/home/user');
    this.currentPath = '/home/user';
    
    // Add some default files
    this.writeFile('/home/user/README.md', '# Welcome\n\nThis is a virtual file system.');
  }

  /**
   * Get current working directory path
   * @returns {string}
   */
  getcwd() {
    return this.currentPath;
  }

  /**
   * Change directory
   * @param {string} path 
   * @returns {string|null} Error message or null if success
   */
  cd(path) {
    if (!path || path === '~') {
      return this.cd('/home/user');
    }
    
    const target = this.resolvePathObject(path);
    
    if (!target) {
      return `cd: ${path}: No such file or directory`;
    }
    
    if (target.type !== 'dir') {
      return `cd: ${path}: Not a directory`;
    }
    
    this.cwd = target;
    this.currentPath = this._getAbsolutePath(target);
    return null;
  }

  /**
   * List directory contents
   * @param {string} path (optional)
   * @returns {Array} List of file objects or error string
   */
  ls(path = '.') {
    const target = this.resolvePathObject(path);
    
    if (!target) {
      return `ls: cannot access '${path}': No such file or directory`;
    }
    
    if (target.type !== 'dir') {
      return [target]; // List the file itself
    }
    
    return Array.from(target.children.values());
  }

  /**
   * Create a directory
   * @param {string} path 
   * @returns {string|null} Error message or null if success
   */
  mkdir(path) {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || (path.startsWith('/') ? '/' : '.');
    const dirName = path.split('/').pop();
    
    const parent = this.resolvePathObject(parentPath);
    if (!parent) {
      return `mkdir: cannot create directory '${path}': No such file or directory`;
    }
    
    if (parent.type !== 'dir') {
      return `mkdir: cannot create directory '${path}': Not a directory`;
    }
    
    if (parent.children.has(dirName)) {
      return `mkdir: cannot create directory '${path}': File exists`;
    }
    
    const newDir = {
      type: 'dir',
      name: dirName,
      children: new Map(),
      parent: parent
    };
    
    parent.children.set(dirName, newDir);
    return null;
  }

  /**
   * Create an empty file or update timestamp
   * @param {string} path 
   */
  touch(path) {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || (path.startsWith('/') ? '/' : '.');
    const fileName = path.split('/').pop();
    
    const parent = this.resolvePathObject(parentPath);
    if (!parent || parent.type !== 'dir') return `touch: cannot touch '${path}': No such file or directory`;
    
    if (!parent.children.has(fileName)) {
      this.writeFile(path, '');
    }
    return null;
  }

  /**
   * Write content to a file
   * @param {string} path 
   * @param {string} content 
   */
  writeFile(path, content) {
    const parentPath = path.substring(0, path.lastIndexOf('/')) || (path.startsWith('/') ? '/' : '.');
    const fileName = path.split('/').pop();
    
    const parent = this.resolvePathObject(parentPath);
    if (!parent || parent.type !== 'dir') return false;
    
    const file = {
      type: 'file',
      name: fileName,
      content: content,
      parent: parent,
      size: content.length,
      lastModified: new Date()
    };
    
    parent.children.set(fileName, file);
    return true;
  }

  /**
   * Read file content
   * @param {string} path 
   * @returns {string} Content or error message
   */
  readFile(path) {
    const target = this.resolvePathObject(path);
    if (!target) return `cat: ${path}: No such file or directory`;
    if (target.type === 'dir') return `cat: ${path}: Is a directory`;
    return target.content;
  }

  /**
   * Remove a file or directory
   * @param {string} path 
   * @param {boolean} recursive 
   */
  rm(path, recursive = false) {
    const target = this.resolvePathObject(path);
    if (!target) return `rm: cannot remove '${path}': No such file or directory`;
    
    if (target.type === 'dir' && !recursive) {
      return `rm: cannot remove '${path}': Is a directory`;
    }
    
    // Cannot remove root
    if (target === this.root) {
      return `rm: it is dangerous to operate recursively on /`;
    }

    const parent = target.parent;
    if (parent) {
      parent.children.delete(target.name);
    }
    return null;
  }

  /**
   * Helper: Resolve path string to object
   */
  resolvePathObject(path) {
    if (!path || path === '.') return this.cwd;
    if (path === '..') return this.cwd.parent || this.root;
    if (path === '/') return this.root;
    if (path === '~') return this.resolvePathObject('/home/user');
    
    // Handle absolute vs relative paths
    let current = path.startsWith('/') ? this.root : this.cwd;
    const parts = path.split('/').filter(p => p && p !== '.');
    
    for (const part of parts) {
      if (part === '..') {
        current = current.parent || this.root;
      } else if (current.type === 'dir' && current.children.has(part)) {
        current = current.children.get(part);
      } else {
        return null;
      }
    }
    
    return current;
  }

  /**
   * Helper: Get absolute path string from object
   */
  _getAbsolutePath(node) {
    if (node === this.root) return '/';
    
    const parts = [];
    let current = node;
    while (current !== this.root) {
      parts.unshift(current.name);
      current = current.parent;
    }
    return '/' + parts.join('/');
  }
}
