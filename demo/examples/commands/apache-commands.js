/**
 * Apache HTTP Server Commands Module
 * Simulated Apache commands for educational purposes
 */

export function registerApacheCommands(terminal) {
  // Apache state simulation
  const apache = {
    running: true,
    enabled: true,
    modules: {
      enabled: ['core', 'so', 'http', 'mpm_prefork', 'authn_file', 'authn_core', 'authz_host', 'authz_user', 'authz_core', 'access_compat', 'auth_basic', 'reqtimeout', 'filter', 'mime', 'log_config', 'env', 'headers', 'setenvif', 'version', 'ssl', 'socache_shmcb', 'rewrite', 'alias', 'dir', 'autoindex', 'status', 'negotiation'],
      available: ['actions', 'alias', 'allowmethods', 'auth_basic', 'auth_digest', 'auth_form', 'authn_anon', 'authn_core', 'authn_dbd', 'authn_dbm', 'authn_file', 'authn_socache', 'authnz_fcgi', 'authnz_ldap', 'authz_core', 'authz_dbd', 'authz_dbm', 'authz_groupfile', 'authz_host', 'authz_owner', 'authz_user', 'autoindex', 'buffer', 'cache', 'cache_disk', 'cache_socache', 'cgi', 'cgid', 'charset_lite', 'data', 'dav', 'dav_fs', 'dav_lock', 'dbd', 'deflate', 'dir', 'dump_io', 'echo', 'env', 'expires', 'ext_filter', 'file_cache', 'filter', 'headers', 'http2', 'include', 'info', 'lbmethod_bybusyness', 'lbmethod_byrequests', 'lbmethod_bytraffic', 'lbmethod_heartbeat', 'ldap', 'log_debug', 'log_forensic', 'lua', 'macro', 'mime', 'mime_magic', 'mpm_event', 'mpm_prefork', 'mpm_worker', 'negotiation', 'proxy', 'proxy_ajp', 'proxy_balancer', 'proxy_connect', 'proxy_express', 'proxy_fcgi', 'proxy_fdpass', 'proxy_ftp', 'proxy_hcheck', 'proxy_html', 'proxy_http', 'proxy_http2', 'proxy_scgi', 'proxy_uwsgi', 'proxy_wstunnel', 'ratelimit', 'reflector', 'remoteip', 'reqtimeout', 'request', 'rewrite', 'sed', 'session', 'session_cookie', 'session_crypto', 'session_dbd', 'setenvif', 'slotmem_plain', 'slotmem_shm', 'socache_dbm', 'socache_memcache', 'socache_redis', 'socache_shmcb', 'speling', 'ssl', 'status', 'substitute', 'suexec', 'unique_id', 'userdir', 'usertrack', 'vhost_alias', 'xml2enc']
    },
    sites: {
      enabled: ['000-default.conf'],
      available: ['000-default.conf', 'default-ssl.conf', 'example.conf', 'ssl.conf', 'proxy.conf', 'redirect.conf']
    }
  };

  // systemctl commands
  terminal.registerCommand('sudo', (args) => {
    if (args[0] === 'systemctl') {
      return handleSystemctl(args.slice(1));
    }
    if (args[0] === 'a2enmod') {
      const mod = args[1];
      if (!mod) return 'ERROR: Module name not specified';
      if (apache.modules.enabled.includes(mod)) {
        return `Module ${mod} already enabled`;
      }
      apache.modules.enabled.push(mod);
      return `Enabling module ${mod}.\nTo activate the new configuration, you need to run:\n  systemctl restart apache2`;
    }
    if (args[0] === 'a2dismod') {
      const mod = args[1];
      if (!mod) return 'ERROR: Module name not specified';
      if (!apache.modules.enabled.includes(mod)) {
        return `Module ${mod} already disabled`;
      }
      apache.modules.enabled = apache.modules.enabled.filter(m => m !== mod);
      return `Disabling module ${mod}.\nTo activate the new configuration, you need to run:\n  systemctl restart apache2`;
    }
    if (args[0] === 'a2ensite') {
      const site = args[1];
      if (!site) return 'ERROR: Site name not specified';
      if (apache.sites.enabled.includes(site)) {
        return `Site ${site} already enabled`;
      }
      apache.sites.enabled.push(site);
      return `Enabling site ${site}.\nTo activate the new configuration, you need to run:\n  systemctl reload apache2`;
    }
    if (args[0] === 'a2dissite') {
      const site = args[1];
      if (!site) return 'ERROR: Site name not specified';
      if (!apache.sites.enabled.includes(site)) {
        return `Site ${site} already disabled`;
      }
      apache.sites.enabled = apache.sites.enabled.filter(s => s !== site);
      return `Disabling site ${site}.\nTo activate the new configuration, you need to run:\n  systemctl reload apache2`;
    }
    if (args[0] === 'a2query') {
      if (args[1] === '-m') {
        return apache.modules.enabled.map(m => `${m} (enabled by site administrator)`).join('\n');
      }
      if (args[1] === '-s') {
        return apache.sites.enabled.map(s => `${s} (enabled by site administrator)`).join('\n');
      }
      return 'Usage: a2query [-m | -s]';
    }
    return '[sudo] password for user: \n[Simulated: Command executed with elevated privileges]';
  });

  function handleSystemctl(args) {
    const action = args[0];
    const service = args[1];

    if (service !== 'apache2' && service !== 'httpd') {
      return `Unit ${service || 'unknown'}.service not found.`;
    }

    switch (action) {
      case 'start':
        apache.running = true;
        return '';
      case 'stop':
        apache.running = false;
        return '';
      case 'restart':
        return '';
      case 'reload':
        return '';
      case 'enable':
        apache.enabled = true;
        return 'Synchronizing state of apache2.service with SysV service script with /lib/systemd/systemd-sysv-install.\nExecuting: /lib/systemd/systemd-sysv-install enable apache2';
      case 'disable':
        apache.enabled = false;
        return 'Synchronizing state of apache2.service with SysV service script with /lib/systemd/systemd-sysv-install.\nExecuting: /lib/systemd/systemd-sysv-install disable apache2';
      case 'status':
        return `● apache2.service - The Apache HTTP Server
     Loaded: loaded (/lib/systemd/system/apache2.service; ${apache.enabled ? 'enabled' : 'disabled'}; vendor preset: enabled)
     Active: ${apache.running ? '\x1b[32mactive (running)\x1b[0m' : '\x1b[31minactive (dead)\x1b[0m'} since ${new Date().toUTCString()}
       Docs: https://httpd.apache.org/docs/2.4/
    Process: 1234 ExecStart=/usr/sbin/apachectl start (code=exited, status=0/SUCCESS)
   Main PID: 5678 (apache2)
      Tasks: 55 (limit: 4915)
     Memory: 12.5M
        CPU: 1.234s
     CGroup: /system.slice/apache2.service
             ├─5678 /usr/sbin/apache2 -k start
             ├─5679 /usr/sbin/apache2 -k start
             └─5680 /usr/sbin/apache2 -k start

Dec 03 10:00:00 server systemd[1]: Starting The Apache HTTP Server...
Dec 03 10:00:01 server systemd[1]: Started The Apache HTTP Server.`;
      default:
        return `Unknown operation '${action}'.`;
    }
  }

  // apachectl
  terminal.registerCommand('apachectl', (args) => {
    if (args.length === 0) {
      return 'Usage: apachectl [-v] [-V] [-t] [-S] [-M] [-l] [start|stop|restart|graceful|graceful-stop|configtest]';
    }

    switch (args[0]) {
      case '-v':
        return `Server version: Apache/2.4.52 (Ubuntu)
Server built:   2024-01-01T00:00:00`;

      case '-V':
        return `Server version: Apache/2.4.52 (Ubuntu)
Server built:   2024-01-01T00:00:00
Server's Module Magic Number: 20120211:121
Server loaded:  APR 1.7.0, APR-UTIL 1.6.1, PCRE 10.39 2021-10-29
Compiled using: APR 1.7.0, APR-UTIL 1.6.1, PCRE2 10.39 2021-10-29
Architecture:   64-bit
Server MPM:     prefork
  threaded:     no
    forked:     yes (variable process count)
Server compiled with....
 -D APR_HAS_SENDFILE
 -D APR_HAS_MMAP
 -D APR_HAVE_IPV6 (IPv4-mapped addresses enabled)
 -D APR_USE_PROC_PTHREAD_SERIALIZE
 -D APR_USE_PTHREAD_SERIALIZE
 -D SINGLE_LISTEN_UNSERIALIZED_ACCEPT
 -D APR_HAS_OTHER_CHILD
 -D AP_HAVE_RELIABLE_PIPED_LOGS
 -D DYNAMIC_MODULE_LIMIT=256
 -D HTTPD_ROOT="/etc/apache2"
 -D SUEXEC_BIN="/usr/lib/apache2/suexec"
 -D DEFAULT_PIDLOG="/var/run/apache2.pid"
 -D DEFAULT_SCOREBOARD="logs/apache_runtime_status"
 -D DEFAULT_ERRORLOG="logs/error_log"
 -D AP_TYPES_CONFIG_FILE="mime.types"
 -D SERVER_CONFIG_FILE="apache2.conf"`;

      case '-t':
      case 'configtest':
        return 'Syntax OK';

      case '-S':
        return `VirtualHost configuration:
*:80                   is a NameVirtualHost
         default server server.example.com (/etc/apache2/sites-enabled/000-default.conf:1)
         port 80 namevhost server.example.com (/etc/apache2/sites-enabled/000-default.conf:1)
                 alias www.example.com
*:443                  is a NameVirtualHost
         default server server.example.com (/etc/apache2/sites-enabled/default-ssl.conf:2)
         port 443 namevhost server.example.com (/etc/apache2/sites-enabled/default-ssl.conf:2)
ServerRoot: "/etc/apache2"
Main DocumentRoot: "/var/www/html"
Main ErrorLog: "/var/log/apache2/error.log"
Mutex ssl-stapling: using_defaults
Mutex ssl-cache: using_defaults
Mutex default: dir="/var/run/apache2/" mechanism=default
Mutex watchdog-callback: using_defaults
PidFile: "/var/run/apache2/apache2.pid"
Define: DUMP_VHOSTS
Define: DUMP_RUN_CFG
User: name="www-data" id=33
Group: name="www-data" id=33`;

      case '-M':
        return `Loaded Modules:\n${apache.modules.enabled.map(m => ` ${m}_module (shared)`).join('\n')}`;

      case '-l':
        return `Compiled in modules:
  core.c
  mod_so.c
  mod_watchdog.c
  http_core.c
  mod_log_config.c
  mod_logio.c
  mod_version.c
  mod_unixd.c`;

      case 'start':
        apache.running = true;
        return '';

      case 'stop':
        apache.running = false;
        return '';

      case 'restart':
        return '';

      case 'graceful':
        return '';

      case 'graceful-stop':
        apache.running = false;
        return '';

      default:
        return `apachectl: '${args[0]}' is not a valid command`;
    }
  });

  // a2enmod/a2dismod without sudo (show error)
  terminal.registerCommand('a2enmod', () => 'ERROR: You must be root to enable modules');
  terminal.registerCommand('a2dismod', () => 'ERROR: You must be root to disable modules');
  terminal.registerCommand('a2ensite', () => 'ERROR: You must be root to enable sites');
  terminal.registerCommand('a2dissite', () => 'ERROR: You must be root to disable sites');
  terminal.registerCommand('a2query', (args) => {
    if (args[0] === '-m') {
      return apache.modules.enabled.map(m => `${m} (enabled by site administrator)`).join('\n');
    }
    if (args[0] === '-s') {
      return apache.sites.enabled.map(s => `${s} (enabled by site administrator)`).join('\n');
    }
    return 'Usage: a2query [-m | -s]';
  });

  // ls command for Apache directories
  terminal.registerCommand('ls', (args) => {
    const path = args.find(a => !a.startsWith('-')) || '.';

    const directories = {
      '/etc/apache2/sites-available/': apache.sites.available.join('  '),
      '/etc/apache2/sites-enabled/': apache.sites.enabled.join('  '),
      '/etc/apache2/mods-available/': 'actions.conf  alias.conf  auth_basic.load  deflate.conf  dir.conf  expires.load  headers.load  mime.conf  proxy.conf  proxy_http.load  rewrite.load  ssl.conf  ssl.load  ...',
      '/etc/apache2/mods-enabled/': apache.modules.enabled.slice(0, 10).map(m => `${m}.load`).join('  ') + '  ...',
      '/etc/apache2/conf-available/': 'charset.conf  localized-error-pages.conf  other-vhosts-access-log.conf  security.conf  serve-cgi-bin.conf',
      '/var/log/apache2/': 'access.log  error.log  other_vhosts_access.log',
      '/var/www/html/': 'index.html  info.php  .htaccess'
    };

    return directories[path] || 'file1  file2  directory/';
  });

  // cat command for Apache config files
  terminal.registerCommand('cat', (args) => {
    if (args.length === 0) return '';

    const path = args[0];
    const files = {
      '/etc/apache2/apache2.conf': `# This is the main Apache server configuration file.
#
# Global configuration
ServerRoot "/etc/apache2"

# Timeout: seconds before receives and sends time out.
Timeout 300

# KeepAlive: persistent connections
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# HostnameLookups: Log names or IP addresses
HostnameLookups Off

# ErrorLog: location of the error log file.
ErrorLog \${APACHE_LOG_DIR}/error.log

# LogLevel: verbosity of messages
LogLevel warn

# Include module configuration:
IncludeOptional mods-enabled/*.load
IncludeOptional mods-enabled/*.conf

# Include list of ports to listen on
Include ports.conf

# Include generic snippets of statements
IncludeOptional conf-enabled/*.conf

# Include the virtual host configurations:
IncludeOptional sites-enabled/*.conf`,

      '/etc/apache2/ports.conf': `# If you just change the port or add more ports here, you will likely also
# have to change the VirtualHost statement in
# /etc/apache2/sites-enabled/000-default.conf

Listen 80

<IfModule ssl_module>
    Listen 443
</IfModule>

<IfModule mod_gnutls.c>
    Listen 443
</IfModule>`,

      '/etc/apache2/sites-available/000-default.conf': `<VirtualHost *:80>
    ServerAdmin webmaster@localhost
    DocumentRoot /var/www/html

    # Available loglevels: trace8, ..., trace1, debug, info, notice, warn,
    # error, crit, alert, emerg.
    # It is also possible to configure the loglevel for particular
    # modules, e.g.
    #LogLevel info ssl:warn

    ErrorLog \${APACHE_LOG_DIR}/error.log
    CustomLog \${APACHE_LOG_DIR}/access.log combined

    # For most configuration files from conf-available/, which are
    # enabled or disabled at a global level, it is possible to
    # include a line for only one particular virtual host.
</VirtualHost>`,

      '/etc/apache2/sites-available/default-ssl.conf': `<IfModule mod_ssl.c>
    <VirtualHost _default_:443>
        ServerAdmin webmaster@localhost
        DocumentRoot /var/www/html

        ErrorLog \${APACHE_LOG_DIR}/error.log
        CustomLog \${APACHE_LOG_DIR}/access.log combined

        SSLEngine on
        SSLCertificateFile    /etc/ssl/certs/ssl-cert-snakeoil.pem
        SSLCertificateKeyFile /etc/ssl/private/ssl-cert-snakeoil.key

        <FilesMatch "\\.(cgi|shtml|phtml|php)$">
            SSLOptions +StdEnvVars
        </FilesMatch>

        <Directory /usr/lib/cgi-bin>
            SSLOptions +StdEnvVars
        </Directory>
    </VirtualHost>
</IfModule>`,

      '/etc/apache2/sites-available/example.conf': `<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com
    DocumentRoot /var/www/example

    <Directory /var/www/example>
        Options Indexes FollowSymLinks
        AllowOverride All
        Require all granted
    </Directory>

    ErrorLog \${APACHE_LOG_DIR}/example_error.log
    CustomLog \${APACHE_LOG_DIR}/example_access.log combined
</VirtualHost>`,

      '/etc/apache2/sites-available/ssl.conf': `<VirtualHost *:443>
    ServerName secure.example.com
    DocumentRoot /var/www/secure

    SSLEngine on
    SSLCertificateFile /etc/ssl/certs/example.crt
    SSLCertificateKeyFile /etc/ssl/private/example.key
    SSLCertificateChainFile /etc/ssl/certs/chain.crt

    # Modern SSL configuration
    SSLProtocol all -SSLv3 -TLSv1 -TLSv1.1
    SSLCipherSuite ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256

    Header always set Strict-Transport-Security "max-age=31536000"

    <Directory /var/www/secure>
        Require all granted
    </Directory>
</VirtualHost>`,

      '/etc/apache2/sites-available/proxy.conf': `<VirtualHost *:80>
    ServerName api.example.com

    ProxyPreserveHost On
    ProxyPass / http://localhost:3000/
    ProxyPassReverse / http://localhost:3000/

    # WebSocket support
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} websocket [NC]
    RewriteCond %{HTTP:Connection} upgrade [NC]
    RewriteRule ^/?(.*) ws://localhost:3000/$1 [P,L]

    ErrorLog \${APACHE_LOG_DIR}/proxy_error.log
    CustomLog \${APACHE_LOG_DIR}/proxy_access.log combined
</VirtualHost>`,

      '/etc/apache2/sites-available/redirect.conf': `<VirtualHost *:80>
    ServerName example.com
    ServerAlias www.example.com

    # Redirect all HTTP to HTTPS
    RewriteEngine On
    RewriteCond %{HTTPS} off
    RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]
</VirtualHost>`,

      '/etc/apache2/envvars': `# envvars - default environment variables for apache2ctl

export APACHE_RUN_USER=www-data
export APACHE_RUN_GROUP=www-data
export APACHE_PID_FILE=/var/run/apache2/apache2$SUFFIX.pid
export APACHE_RUN_DIR=/var/run/apache2$SUFFIX
export APACHE_LOCK_DIR=/var/lock/apache2$SUFFIX
export APACHE_LOG_DIR=/var/log/apache2$SUFFIX`,

      '.htaccess-redirect': `# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]`,

      '.htaccess-rewrite': `# Clean URLs
RewriteEngine On
RewriteBase /

# Remove .php extension
RewriteCond %{REQUEST_FILENAME} !-d
RewriteCond %{REQUEST_FILENAME}\\.php -f
RewriteRule ^(.*)$ $1.php [L]

# Pretty URLs
RewriteRule ^product/([0-9]+)/?$ product.php?id=$1 [L,QSA]`,

      '.htaccess-auth': `# Password Protection
AuthType Basic
AuthName "Restricted Area"
AuthUserFile /var/www/.htpasswd
Require valid-user`,

      '.htaccess-cache': `# Browser Caching
<IfModule mod_expires.c>
    ExpiresActive On
    ExpiresByType image/jpg "access plus 1 year"
    ExpiresByType image/jpeg "access plus 1 year"
    ExpiresByType image/gif "access plus 1 year"
    ExpiresByType image/png "access plus 1 year"
    ExpiresByType text/css "access plus 1 month"
    ExpiresByType application/javascript "access plus 1 month"
</IfModule>`,

      '.htaccess-security': `# Security Headers
<IfModule mod_headers.c>
    Header set X-Content-Type-Options "nosniff"
    Header set X-Frame-Options "SAMEORIGIN"
    Header set X-XSS-Protection "1; mode=block"
    Header set Referrer-Policy "strict-origin-when-cross-origin"
    Header set Content-Security-Policy "default-src 'self'"
</IfModule>

# Disable directory listing
Options -Indexes

# Protect sensitive files
<FilesMatch "^\\.(htaccess|htpasswd|ini|log|sh|sql)$">
    Require all denied
</FilesMatch>`,

      '.htaccess-cors': `# CORS Headers
<IfModule mod_headers.c>
    Header set Access-Control-Allow-Origin "*"
    Header set Access-Control-Allow-Methods "GET, POST, OPTIONS"
    Header set Access-Control-Allow-Headers "Content-Type, Authorization"
</IfModule>`,

      'rewrite-examples': `# URL Rewriting Examples

# 1. Remove .html extension
RewriteRule ^([^.]+)$ $1.html [L]

# 2. Redirect old URL to new
RewriteRule ^old-page$ /new-page [R=301,L]

# 3. Force trailing slash
RewriteCond %{REQUEST_FILENAME} !-f
RewriteRule ^(.*[^/])$ /$1/ [L,R=301]

# 4. Remove index.php from URL
RewriteCond %{THE_REQUEST} /index\\.php [NC]
RewriteRule ^(.*)index\\.php$ /$1 [L,R=301]`,

      'rewrite-wordpress': `# WordPress Rewrite Rules
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule .* - [E=HTTP_AUTHORIZATION:%{HTTP:Authorization}]
    RewriteBase /
    RewriteRule ^index\\.php$ - [L]
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteRule . /index.php [L]
</IfModule>`,

      'rewrite-laravel': `# Laravel Rewrite Rules
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteRule ^(.*)$ public/$1 [L]
</IfModule>

# In public/.htaccess
<IfModule mod_rewrite.c>
    RewriteEngine On
    RewriteCond %{REQUEST_FILENAME} !-d
    RewriteCond %{REQUEST_FILENAME} !-f
    RewriteRule ^ index.php [L]
</IfModule>`,

      'proxy-config': `# Basic Reverse Proxy
ProxyRequests Off
ProxyPreserveHost On

<Proxy *>
    Require all granted
</Proxy>

ProxyPass /api http://backend-server:8080/api
ProxyPassReverse /api http://backend-server:8080/api`,

      'proxy-nodejs': `# Node.js Application Proxy
<VirtualHost *:80>
    ServerName app.example.com

    ProxyPass / http://127.0.0.1:3000/
    ProxyPassReverse / http://127.0.0.1:3000/

    # Enable WebSocket proxying
    RewriteEngine On
    RewriteCond %{HTTP:Upgrade} =websocket [NC]
    RewriteRule /(.*)           ws://127.0.0.1:3000/$1 [P,L]
</VirtualHost>`,

      'proxy-loadbalance': `# Load Balancer Configuration
<Proxy "balancer://mycluster">
    BalancerMember http://backend1:8080
    BalancerMember http://backend2:8080
    BalancerMember http://backend3:8080
    ProxySet lbmethod=byrequests
</Proxy>

ProxyPass "/" "balancer://mycluster/"
ProxyPassReverse "/" "balancer://mycluster/"`,

      'security-config': `# Apache Security Configuration

# Hide Apache Version
ServerTokens Prod
ServerSignature Off

# Disable TRACE method
TraceEnable Off

# Prevent clickjacking
Header always set X-Frame-Options "SAMEORIGIN"

# XSS Protection
Header always set X-XSS-Protection "1; mode=block"

# Prevent MIME-sniffing
Header always set X-Content-Type-Options "nosniff"`,

      'security-headers': `<IfModule mod_headers.c>
    # HSTS - force HTTPS
    Header always set Strict-Transport-Security "max-age=31536000; includeSubDomains"

    # Content Security Policy
    Header always set Content-Security-Policy "default-src 'self'; script-src 'self' 'unsafe-inline'; style-src 'self' 'unsafe-inline'"

    # Referrer Policy
    Header always set Referrer-Policy "strict-origin-when-cross-origin"

    # Permissions Policy
    Header always set Permissions-Policy "geolocation=(), microphone=(), camera=()"
</IfModule>`,

      'directory-security': `# Directory Security
<Directory /var/www/html>
    Options -Indexes -FollowSymLinks
    AllowOverride None
    Require all granted
</Directory>

<Directory /var/www/html/uploads>
    # Disable PHP execution in uploads
    php_admin_flag engine off
    AddType text/plain .php .php3 .php4 .php5 .phtml
</Directory>

# Protect sensitive files
<FilesMatch "^\\.(htaccess|htpasswd|git|svn)">
    Require all denied
</FilesMatch>`,

      'mpm-config': `# MPM Prefork Configuration
<IfModule mpm_prefork_module>
    StartServers          5
    MinSpareServers       5
    MaxSpareServers      10
    MaxRequestWorkers   150
    MaxConnectionsPerChild   0
</IfModule>

# MPM Worker Configuration
<IfModule mpm_worker_module>
    StartServers          2
    MinSpareThreads      25
    MaxSpareThreads      75
    ThreadLimit          64
    ThreadsPerChild      25
    MaxRequestWorkers   150
    MaxConnectionsPerChild   0
</IfModule>`,

      'keepalive-config': `# KeepAlive Configuration
KeepAlive On
MaxKeepAliveRequests 100
KeepAliveTimeout 5

# For high traffic sites, consider:
# KeepAliveTimeout 2
# MaxKeepAliveRequests 500`
    };

    return files[path] || `cat: ${path}: No such file or directory`;
  });

  // tail command for logs
  terminal.registerCommand('tail', (args) => {
    const follow = args.includes('-f');
    const path = args.find(a => !a.startsWith('-'));

    const logs = {
      '/var/log/apache2/error.log': `[${new Date().toUTCString()}] [error] [client 192.168.1.100] File does not exist: /var/www/html/favicon.ico
[${new Date().toUTCString()}] [warn] [client 192.168.1.101] ModSecurity: Warning. Pattern match "\\\\<script" at ARGS:comment
[${new Date().toUTCString()}] [error] [client 192.168.1.102] client denied by server configuration: /var/www/html/.htaccess
[${new Date().toUTCString()}] [notice] Apache/2.4.52 (Ubuntu) configured -- resuming normal operations
[${new Date().toUTCString()}] [error] [client 192.168.1.103] PHP Fatal error:  Allowed memory size exhausted`,

      '/var/log/apache2/access.log': `192.168.1.100 - - [03/Dec/2024:10:15:30 +0000] "GET / HTTP/1.1" 200 1234 "-" "Mozilla/5.0"
192.168.1.101 - - [03/Dec/2024:10:15:31 +0000] "GET /style.css HTTP/1.1" 200 5678 "http://example.com/" "Mozilla/5.0"
192.168.1.102 - - [03/Dec/2024:10:15:32 +0000] "POST /api/login HTTP/1.1" 200 89 "-" "curl/7.81.0"
192.168.1.103 - - [03/Dec/2024:10:15:33 +0000] "GET /admin HTTP/1.1" 403 199 "-" "Mozilla/5.0"
192.168.1.104 - - [03/Dec/2024:10:15:34 +0000] "GET /notfound HTTP/1.1" 404 196 "-" "Mozilla/5.0"`
    };

    const content = logs[path];
    if (!content) return `tail: ${path}: No such file or directory`;

    if (follow) {
      return content + '\n\n[Following... Press Ctrl+C to stop]';
    }
    return content;
  });

  // grep for logs
  terminal.registerCommand('grep', (args) => {
    const pattern = args.find(a => !a.startsWith('-'));
    const file = args[args.length - 1];

    if (pattern === '404') {
      return `192.168.1.104 - - [03/Dec/2024:10:15:34 +0000] "GET /notfound HTTP/1.1" 404 196
192.168.1.105 - - [03/Dec/2024:10:16:12 +0000] "GET /missing.html HTTP/1.1" 404 196
192.168.1.106 - - [03/Dec/2024:10:17:45 +0000] "GET /old-page HTTP/1.1" 404 196`;
    }
    if (pattern === '500') {
      return `[error] PHP Fatal error: Uncaught Exception in /var/www/html/app.php:42
[error] PHP Fatal error: Allowed memory size exhausted in /var/www/html/upload.php:156`;
    }
    return `Matching lines for "${pattern}"...`;
  });

  // netstat for ports
  terminal.registerCommand('netstat', (args) => {
    return `Active Internet connections (only servers)
Proto Recv-Q Send-Q Local Address           Foreign Address         State       PID/Program name
tcp        0      0 0.0.0.0:80              0.0.0.0:*               LISTEN      1234/apache2
tcp        0      0 0.0.0.0:443             0.0.0.0:*               LISTEN      1234/apache2
tcp        0      0 0.0.0.0:22              0.0.0.0:*               LISTEN      567/sshd
tcp6       0      0 :::80                   :::*                    LISTEN      1234/apache2
tcp6       0      0 :::443                  :::*                    LISTEN      1234/apache2`;
  });

  // curl for testing
  terminal.registerCommand('curl', (args) => {
    if (args.includes('-I')) {
      return `HTTP/1.1 200 OK
Date: ${new Date().toUTCString()}
Server: Apache/2.4.52 (Ubuntu)
Last-Modified: Mon, 02 Dec 2024 12:00:00 GMT
Content-Type: text/html; charset=UTF-8
Content-Length: 1234
Connection: keep-alive`;
    }
    return '<html><head><title>It works!</title></head><body><h1>It works!</h1></body></html>';
  });

  // lsof for port checking
  terminal.registerCommand('lsof', (args) => {
    const port = args.find(a => a.startsWith(':'))?.slice(1) || '80';
    return `COMMAND   PID     USER   FD   TYPE DEVICE SIZE/OFF NODE NAME
apache2  1234 www-data    4u  IPv4  12345      0t0  TCP *:${port} (LISTEN)
apache2  1235 www-data    4u  IPv4  12345      0t0  TCP *:${port} (LISTEN)
apache2  1236 www-data    4u  IPv4  12345      0t0  TCP *:${port} (LISTEN)`;
  });

  // htpasswd
  terminal.registerCommand('htpasswd', (args) => {
    if (args.includes('-c')) {
      return `New password:
Re-type new password:
Adding password for user ${args[args.length - 1]}`;
    }
    return 'Usage: htpasswd [-c] passwordfile username';
  });

  // openssl for certificates
  terminal.registerCommand('openssl', (args) => {
    if (args[0] === 'req' && args.includes('-x509')) {
      return `Generating a RSA private key
...+++++
...........+++++
writing new private key to 'server.key'
-----
You are about to be asked to enter information that will be incorporated
into your certificate request.
-----
Country Name (2 letter code) [AU]: US
State or Province Name (full name) [Some-State]: California
Locality Name (eg, city) []: San Francisco
Organization Name (eg, company) [Internet Widgits Pty Ltd]: Example Inc
Common Name (e.g. server FQDN or YOUR name) []: example.com
Email Address []: admin@example.com`;
    }
    if (args[0] === 'x509') {
      return `Certificate:
    Data:
        Version: 3 (0x2)
        Serial Number: 1234567890
        Signature Algorithm: sha256WithRSAEncryption
        Issuer: C=US, ST=California, L=San Francisco, O=Example Inc, CN=example.com
        Validity
            Not Before: Jan  1 00:00:00 2024 GMT
            Not After : Dec 31 23:59:59 2024 GMT
        Subject: C=US, ST=California, L=San Francisco, O=Example Inc, CN=example.com`;
    }
    return 'OpenSSL command executed';
  });

  // ab (Apache Benchmark)
  terminal.registerCommand('ab', (args) => {
    return `This is ApacheBench, Version 2.3 <$Revision: 1879490 $>

Server Software:        Apache/2.4.52
Server Hostname:        localhost
Server Port:            80

Document Path:          /
Document Length:        1234 bytes

Concurrency Level:      100
Time taken for tests:   2.345 seconds
Complete requests:      1000
Failed requests:        0
Total transferred:      1456000 bytes
HTML transferred:       1234000 bytes
Requests per second:    426.44 [#/sec] (mean)
Time per request:       234.500 [ms] (mean)
Time per request:       2.345 [ms] (mean, across all concurrent requests)
Transfer rate:          606.23 [Kbytes/sec] received

Connection Times (ms)
              min  mean[+/-sd] median   max
Connect:        0    5   2.3      4      15
Processing:    10   85  45.2     75     250
Waiting:        8   80  42.1     70     240
Total:         12   90  46.5     80     260

Percentage of the requests served within a certain time (ms)
  50%     80
  66%     95
  75%    110
  80%    120
  90%    150
  95%    180
  98%    220
  99%    245
 100%    260 (longest request)`;
  });

  // Help command
  terminal.registerCommand('help', () => {
    return `Apache HTTP Server Tutorial - Available Commands

SERVICE CONTROL:
  sudo systemctl start apache2     Start Apache
  sudo systemctl stop apache2      Stop Apache
  sudo systemctl restart apache2   Restart Apache
  sudo systemctl reload apache2    Reload configuration
  sudo systemctl status apache2    Check status

APACHE CONTROL:
  apachectl -t                     Test configuration
  apachectl -S                     Show virtual hosts
  apachectl -M                     List loaded modules
  apachectl -v                     Show version

MODULE MANAGEMENT:
  sudo a2enmod <module>            Enable module
  sudo a2dismod <module>           Disable module
  a2query -m                       List enabled modules

SITE MANAGEMENT:
  sudo a2ensite <site>             Enable site
  sudo a2dissite <site>            Disable site
  a2query -s                       List enabled sites

CONFIGURATION FILES:
  /etc/apache2/apache2.conf        Main configuration
  /etc/apache2/sites-available/    Virtual host configs
  /etc/apache2/mods-available/     Module configs

LOGS:
  /var/log/apache2/error.log       Error log
  /var/log/apache2/access.log      Access log

Click commands in the sidebar to see them in action!`;
  });
}
