/**
 * cURL Commands Module
 * Simulated curl commands for educational purposes
 */

export function registerCurlCommands(terminal) {
  // Simulated API responses
  const apiResponses = {
    'api.example.com': {
      '/': { message: 'Welcome to the API', version: '1.0.0' },
      '/users': [
        { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
        { id: 2, name: 'Jane Smith', email: 'jane@example.com', status: 'active' },
        { id: 3, name: 'Bob Wilson', email: 'bob@example.com', status: 'inactive' }
      ],
      '/users/1': { id: 1, name: 'John Doe', email: 'john@example.com', status: 'active' },
      '/protected': { error: 'Unauthorized', message: 'Valid token required' },
      '/admin': { message: 'Admin access granted', role: 'administrator' },
      '/search': { results: [], query: '', total: 0 },
      '/upload': { success: true, message: 'File uploaded successfully' }
    },
    'api.github.com': {
      '/users/octocat': {
        login: 'octocat',
        id: 583231,
        name: 'The Octocat',
        company: '@github',
        blog: 'https://github.blog',
        location: 'San Francisco',
        bio: null,
        public_repos: 8,
        followers: 9847,
        following: 9
      }
    },
    'api.ipify.org': { ip: '203.0.113.42' },
    'example.com': '<html><head><title>Example</title></head><body><h1>Hello World</h1></body></html>',
    'api.exchangerate-api.com': {
      '/v4/latest/USD': {
        base: 'USD',
        rates: { EUR: 0.92, GBP: 0.79, JPY: 149.50, CAD: 1.36 }
      }
    }
  };

  // Parse curl command into components
  const parseCurl = (args) => {
    const options = {
      method: 'GET',
      headers: {},
      data: null,
      output: null,
      verbose: false,
      silent: false,
      includeHeaders: false,
      headersOnly: false,
      followRedirects: false,
      insecure: false,
      user: null,
      upload: null,
      compressed: false,
      writeOut: null,
      connectTimeout: null,
      maxTime: null,
      retry: 0,
      proxy: null
    };

    let url = null;
    let i = 0;

    while (i < args.length) {
      const arg = args[i];

      if (arg === '-X' || arg === '--request') {
        options.method = args[++i]?.toUpperCase() || 'GET';
      } else if (arg === '-H' || arg === '--header') {
        const header = args[++i] || '';
        const [key, ...valueParts] = header.split(':');
        if (key) options.headers[key.trim()] = valueParts.join(':').trim();
      } else if (arg === '-d' || arg === '--data') {
        options.data = args[++i] || '';
        if (options.method === 'GET') options.method = 'POST';
      } else if (arg === '--data-urlencode') {
        options.data = encodeURIComponent(args[++i] || '');
        if (options.method === 'GET') options.method = 'POST';
      } else if (arg === '-F' || arg === '--form') {
        options.data = args[++i] || '';
        options.method = 'POST';
        options.headers['Content-Type'] = 'multipart/form-data';
      } else if (arg === '-o' || arg === '--output') {
        options.output = args[++i];
      } else if (arg === '-O' || arg === '--remote-name') {
        options.output = 'remote';
      } else if (arg === '-v' || arg === '--verbose') {
        options.verbose = true;
      } else if (arg === '-s' || arg === '--silent') {
        options.silent = true;
      } else if (arg === '-S' || arg === '--show-error') {
        options.showError = true;
      } else if (arg === '-i' || arg === '--include') {
        options.includeHeaders = true;
      } else if (arg === '-I' || arg === '--head') {
        options.headersOnly = true;
        options.method = 'HEAD';
      } else if (arg === '-L' || arg === '--location') {
        options.followRedirects = true;
      } else if (arg === '-k' || arg === '--insecure') {
        options.insecure = true;
      } else if (arg === '-u' || arg === '--user') {
        options.user = args[++i];
      } else if (arg === '-T' || arg === '--upload-file') {
        options.upload = args[++i];
        options.method = 'PUT';
      } else if (arg === '-c' || arg === '--cookie-jar') {
        options.cookieJar = args[++i];
      } else if (arg === '-b' || arg === '--cookie') {
        options.cookie = args[++i];
      } else if (arg === '--compressed') {
        options.compressed = true;
      } else if (arg === '-w' || arg === '--write-out') {
        options.writeOut = args[++i];
      } else if (arg === '--connect-timeout') {
        options.connectTimeout = args[++i];
      } else if (arg === '--max-time' || arg === '-m') {
        options.maxTime = args[++i];
      } else if (arg === '--retry') {
        options.retry = parseInt(args[++i]) || 0;
      } else if (arg === '-x' || arg === '--proxy') {
        options.proxy = args[++i];
      } else if (arg === '--cacert') {
        options.cacert = args[++i];
      } else if (arg === '--cert') {
        options.cert = args[++i];
      } else if (arg === '--key') {
        options.key = args[++i];
      } else if (arg === '-f' || arg === '--fail') {
        options.fail = true;
      } else if (arg === '-C') {
        options.resume = args[++i];
      } else if (arg === '--limit-rate') {
        options.limitRate = args[++i];
      } else if (arg === '--tlsv1.2' || arg === '--tlsv1.3') {
        options.tlsVersion = arg;
      } else if (arg === '--basic' || arg === '--digest') {
        options.authType = arg.slice(2);
      } else if (arg === '--oauth2-bearer') {
        options.headers['Authorization'] = `Bearer ${args[++i]}`;
      } else if (arg === '--trace') {
        options.trace = args[++i];
      } else if (arg === '--trace-ascii') {
        options.traceAscii = args[++i];
      } else if (arg === '--max-redirs') {
        options.maxRedirs = args[++i];
      } else if (arg === '--retry-delay') {
        options.retryDelay = args[++i];
      } else if (arg === '--retry-max-time') {
        options.retryMaxTime = args[++i];
      } else if (arg === '--noproxy') {
        options.noproxy = args[++i];
      } else if (arg === '--proxy-user') {
        options.proxyUser = args[++i];
      } else if (arg === '-K' || arg === '--config') {
        options.config = args[++i];
      } else if (arg === '--fail-with-body') {
        options.failWithBody = true;
      } else if (arg === '--keepalive-time') {
        options.keepaliveTime = args[++i];
      } else if (arg === '--netrc') {
        options.netrc = true;
      } else if (!arg.startsWith('-')) {
        url = arg;
      }

      i++;
    }

    return { url, options };
  };

  // Generate response headers
  const generateHeaders = (url, options, statusCode = 200) => {
    const date = new Date().toUTCString();
    const headers = [
      `HTTP/1.1 ${statusCode} ${statusCode === 200 ? 'OK' : statusCode === 201 ? 'Created' : statusCode === 404 ? 'Not Found' : 'Error'}`,
      `Date: ${date}`,
      `Server: nginx/1.18.0`,
      `Content-Type: application/json; charset=utf-8`,
      `Content-Length: 256`,
      `Connection: keep-alive`,
      `Cache-Control: max-age=0, private, must-revalidate`,
      `X-Request-Id: ${Math.random().toString(36).substr(2, 9)}`,
      `X-Runtime: 0.042`,
      ''
    ];

    if (options.headers['Authorization']) {
      headers.splice(7, 0, 'X-Authenticated: true');
    }

    return headers.join('\n');
  };

  // Generate verbose output
  const generateVerbose = (url, options) => {
    const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
    const host = urlObj.hostname;
    const path = urlObj.pathname || '/';

    return `*   Trying 93.184.216.34:443...
* Connected to ${host} (93.184.216.34) port 443 (#0)
* ALPN, offering h2
* ALPN, offering http/1.1
* TLSv1.3 (OUT), TLS handshake, Client hello (1):
* TLSv1.3 (IN), TLS handshake, Server hello (2):
* TLSv1.3 (IN), TLS handshake, Certificate (11):
* TLSv1.3 (IN), TLS handshake, CERT verify (15):
* TLSv1.3 (IN), TLS handshake, Finished (20):
* TLSv1.3 (OUT), TLS handshake, Finished (20):
* SSL connection using TLSv1.3 / TLS_AES_256_GCM_SHA384
* ALPN, server accepted to use h2
* Server certificate:
*  subject: CN=${host}
*  start date: Jan  1 00:00:00 2024 GMT
*  expire date: Dec 31 23:59:59 2024 GMT
*  issuer: C=US; O=DigiCert Inc; CN=DigiCert TLS RSA SHA256 2020 CA1
*  SSL certificate verify ok.
> ${options.method} ${path} HTTP/2
> Host: ${host}
> user-agent: curl/7.81.0
> accept: */*
${Object.entries(options.headers).map(([k, v]) => `> ${k}: ${v}`).join('\n')}
>
< HTTP/2 200
< date: ${new Date().toUTCString()}
< content-type: application/json
< server: nginx
<
`;
  };

  // Get simulated response for URL
  const getResponse = (url, options) => {
    try {
      const urlObj = new URL(url.startsWith('http') ? url : `https://${url}`);
      const host = urlObj.hostname;
      const path = urlObj.pathname || '/';
      const query = urlObj.search;

      let response = null;
      let statusCode = 200;

      // Check for auth requirements
      if (path.includes('protected') && !options.headers['Authorization']) {
        statusCode = 401;
        response = { error: 'Unauthorized', message: 'Authentication required' };
      } else if (path.includes('admin') && !options.user) {
        statusCode = 401;
        response = { error: 'Unauthorized', message: 'Admin credentials required' };
      }

      // Get response from our mock data
      if (!response) {
        const hostData = apiResponses[host];
        if (hostData) {
          if (typeof hostData === 'string') {
            response = hostData;
          } else if (hostData[path]) {
            response = hostData[path];
          } else if (path.match(/\/users\/\d+/) && hostData['/users']) {
            const id = parseInt(path.split('/').pop());
            response = hostData['/users'].find(u => u.id === id) || { error: 'Not found' };
            if (response.error) statusCode = 404;
          } else {
            response = { message: `Response from ${host}${path}` };
          }
        } else {
          response = { message: `Mock response from ${host}${path}`, timestamp: new Date().toISOString() };
        }
      }

      // Handle different methods
      if (options.method === 'POST') {
        statusCode = 201;
        if (options.data) {
          try {
            const parsed = JSON.parse(options.data.replace(/'/g, '"'));
            response = { id: Math.floor(Math.random() * 1000), ...parsed, created_at: new Date().toISOString() };
          } catch {
            response = { success: true, message: 'Data received', data: options.data };
          }
        }
      } else if (options.method === 'PUT' || options.method === 'PATCH') {
        response = { id: 1, updated: true, updated_at: new Date().toISOString() };
      } else if (options.method === 'DELETE') {
        response = { deleted: true, message: 'Resource deleted successfully' };
      }

      // Special endpoints
      if (host === 'api.ipify.org') {
        if (query.includes('format=json')) {
          response = { ip: '203.0.113.42' };
        } else {
          response = '203.0.113.42';
        }
      } else if (host === 'wttr.in') {
        response = 'London: ☀️ +12°C';
      } else if (host.includes('slack.com')) {
        response = { ok: true, message: 'Message posted to channel' };
      }

      return { response, statusCode };
    } catch (e) {
      return { response: { error: 'Invalid URL' }, statusCode: 400 };
    }
  };

  // Main curl command handler
  terminal.registerCommand('curl', (args) => {
    if (args.length === 0) {
      return `curl: try 'curl --help' for more information`;
    }

    if (args[0] === '--help' || args[0] === '-h') {
      return `Usage: curl [options...] <url>

OPTIONS:
  -X, --request <method>    Specify request method (GET, POST, PUT, DELETE, etc.)
  -H, --header <header>     Add header to request
  -d, --data <data>         Send data in POST request
  -F, --form <data>         Send multipart form data
  -o, --output <file>       Write output to file
  -O, --remote-name         Write output to file with remote name
  -v, --verbose             Show verbose output
  -s, --silent              Silent mode
  -i, --include             Include response headers
  -I, --head                Show headers only
  -L, --location            Follow redirects
  -u, --user <user:pass>    Basic authentication
  -k, --insecure            Allow insecure connections
  -c, --cookie-jar <file>   Save cookies to file
  -b, --cookie <data>       Send cookies
  --compressed              Request compressed response
  -w, --write-out <format>  Output format string
  --connect-timeout <secs>  Connection timeout
  --max-time <secs>         Maximum time for operation
  --retry <num>             Retry failed requests

EXAMPLES:
  curl https://api.example.com
  curl -X POST -d "name=John" https://api.example.com/users
  curl -H "Authorization: Bearer token" https://api.example.com/protected`;
    }

    const { url, options } = parseCurl(args);

    if (!url) {
      return 'curl: no URL specified!';
    }

    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    const { response, statusCode } = getResponse(fullUrl, options);

    let output = '';

    // Verbose output
    if (options.verbose) {
      output += generateVerbose(fullUrl, options);
    }

    // Write-out format
    if (options.writeOut) {
      const format = options.writeOut
        .replace('%{http_code}', statusCode.toString())
        .replace('%{time_total}', (Math.random() * 0.5 + 0.1).toFixed(3))
        .replace('%{size_download}', Math.floor(Math.random() * 5000 + 500).toString())
        .replace('\\n', '\n');

      if (options.output === '/dev/null') {
        return format;
      }
      output = format;
    }

    // Headers only
    if (options.headersOnly) {
      return generateHeaders(fullUrl, options, statusCode);
    }

    // Include headers
    if (options.includeHeaders) {
      output += generateHeaders(fullUrl, options, statusCode) + '\n';
    }

    // Output file
    if (options.output && options.output !== '/dev/null') {
      const filename = options.output === 'remote' ? fullUrl.split('/').pop() || 'index.html' : options.output;

      if (options.limitRate) {
        return `  % Total    % Received  Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1256  100  1256    0     0   ${options.limitRate}      0  0:00:12  0:00:12 --:--:-- ${options.limitRate}
'${filename}' saved [1256/1256]`;
      }

      return `  % Total    % Received  Time    Time     Time  Current
                                 Dload  Upload   Total   Spent    Left  Speed
100  1256  100  1256    0     0  12560      0 --:--:-- --:--:-- --:--:-- 12560`;
    }

    // Format response
    if (typeof response === 'string') {
      output += response;
    } else {
      output += JSON.stringify(response, null, 2);
    }

    // Check for fail flag
    if (options.fail && statusCode >= 400) {
      return `curl: (22) The requested URL returned error: ${statusCode}`;
    }

    return output;
  });

  // jq command for JSON processing
  terminal.registerCommand('jq', (args) => {
    if (args.length === 0) {
      return `jq - commandline JSON processor [version 1.6]

Usage: jq [options...] <jq filter> [file...]

The simplest filter is . which copies the input to output unchanged.

Example:
  echo '{"name":"John"}' | jq .name
  => "John"`;
    }

    const filter = args[0];

    // Simple jq simulation
    if (filter === '.') {
      return '(piped JSON would be pretty-printed here)';
    }

    if (filter.startsWith('.')) {
      const key = filter.slice(1);
      return `"value_of_${key}"`;
    }

    return '(jq filter applied)';
  });

  // wget for comparison
  terminal.registerCommand('wget', (args) => {
    if (args.length === 0) {
      return 'wget: missing URL';
    }

    const url = args.find(a => !a.startsWith('-')) || '';
    const quiet = args.includes('-q');
    const output = args.includes('-O') ? args[args.indexOf('-O') + 1] : null;

    if (quiet) {
      return null;
    }

    return `--${new Date().toISOString().replace('T', ' ').slice(0, 19)}--  ${url}
Resolving ${url.replace(/https?:\/\//, '').split('/')[0]}... 93.184.216.34
Connecting to ${url.replace(/https?:\/\//, '').split('/')[0]}|93.184.216.34|:443... connected.
HTTP request sent, awaiting response... 200 OK
Length: 1256 (1.2K) [text/html]
Saving to: '${output || 'index.html'}'

${output || 'index.html'}      100%[===================>]   1.23K  --.-KB/s    in 0s

${new Date().toISOString().replace('T', ' ').slice(0, 19)} (12.3 MB/s) - '${output || 'index.html'}' saved [1256/1256]`;
  });

  // Help command
  terminal.registerCommand('help', () => {
    return `cURL Tutorial - Available Commands

BASIC USAGE:
  curl <url>                    Make a GET request
  curl -v <url>                 Verbose mode (debugging)
  curl -s <url>                 Silent mode (scripting)

HTTP METHODS:
  curl -X POST <url>            POST request
  curl -X PUT <url>             PUT request
  curl -X DELETE <url>          DELETE request

SENDING DATA:
  curl -d "data" <url>          Send form data
  curl -H "Header: value" <url> Add custom header
  curl -F "file=@path" <url>    Upload file

AUTHENTICATION:
  curl -u user:pass <url>       Basic authentication
  curl -H "Authorization: Bearer token" <url>

OUTPUT:
  curl -o file.html <url>       Save to file
  curl -I <url>                 Headers only
  curl -i <url>                 Include headers

OTHER:
  curl -L <url>                 Follow redirects
  curl -k <url>                 Skip SSL verification
  curl --help                   Full help

Also available: wget, jq

Try clicking the examples in the sidebar to see curl in action!`;
  });
}
