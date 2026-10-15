const http = require('http');
const fs = require('fs');
const path = require('path');
const https = require('https');

const PORT = 3000;
const ROOT = process.cwd();

const MASTER_REGISTRY_ID = 'ff808181a09d98f701a100b1b6ea69d1';
const CANONICAL_USER_OBJECT_ID = 'ff808181a09d98f701a103d242b06f48';

const MIME_TYPES = {
  '.html': 'text/html; charset=utf-8',
  '.js': 'application/javascript; charset=utf-8',
  '.css': 'text/css; charset=utf-8',
  '.json': 'application/json; charset=utf-8',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.svg': 'image/svg+xml',
  '.ico': 'image/x-icon',
  '.woff': 'font/woff',
  '.woff2': 'font/woff2',
  '.ttf': 'font/ttf'
};

function fetchRestfulApi(pathname, method = 'GET', body = null) {
  return new Promise((resolve, reject) => {
    const payload = body ? (typeof body === 'string' ? body : JSON.stringify(body)) : null;
    const headers = {
      'Accept': 'application/json'
    };
    if (payload) {
      headers['Content-Type'] = 'application/json';
      headers['Content-Length'] = Buffer.byteLength(payload);
    }
    const req = https.request({
      hostname: 'api.restful-api.dev',
      port: 443,
      path: pathname,
      method: method,
      headers: headers
    }, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        try {
          resolve({ status: res.statusCode, data: JSON.parse(data) });
        } catch (e) {
          resolve({ status: res.statusCode, raw: data });
        }
      });
    });
    req.on('error', err => reject(err));
    if (payload) req.write(payload);
    req.end();
  });
}

const server = http.createServer(async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', '*');
  res.setHeader('Cache-Control', 'no-cache, no-store, must-revalidate');

  if (req.method === 'OPTIONS') {
    res.writeHead(204);
    res.end();
    return;
  }

  const urlObj = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  const reqPath = urlObj.pathname;

  // 1. API: Master Registry
  if (reqPath === '/api/registry') {
    try {
      const remote = await fetchRestfulApi('/objects/' + MASTER_REGISTRY_ID);
      if (remote.status === 200 && remote.data && remote.data.data) {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify(remote.data.data));
        return;
      }
    } catch (e) {
      console.warn('Proxy registry error:', e.message);
    }

    // Default fallback registry
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      users: [
        { email: 'ferjrm@hotmail.com', objectId: CANONICAL_USER_OBJECT_ID, pwd: 'raquel' },
        { email: 'ferjrm', objectId: CANONICAL_USER_OBJECT_ID, pwd: 'raquel' },
        { email: 'ferjrm@gmail.com', objectId: CANONICAL_USER_OBJECT_ID, pwd: 'raquel' },
        { email: 'raquel', objectId: CANONICAL_USER_OBJECT_ID, pwd: 'raquel' }
      ],
      updatedAt: Date.now()
    }));
    return;
  }

  // 2. API: User Data Fetch & Push
  if (reqPath.startsWith('/api/user_data')) {
    const id = urlObj.searchParams.get('id') || CANONICAL_USER_OBJECT_ID;
    if (req.method === 'GET') {
      try {
        const remote = await fetchRestfulApi('/objects/' + id);
        if (remote.status === 200 && remote.data && remote.data.data) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify(remote.data.data));
          return;
        }
      } catch (e) {
        console.warn('Proxy user_data GET error:', e.message);
      }
      res.writeHead(200, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({
        account: 'ferjrm@hotmail.com',
        settings: { initialCapital: 180000 },
        revisions: [{ id: 1, name: 'Revisión Inicial', feeTotal: 600 }],
        payments: []
      }));
      return;
    }

    if (req.method === 'PUT' || req.method === 'POST') {
      let bodyData = '';
      req.on('data', chunk => bodyData += chunk);
      req.on('end', async () => {
        try {
          const parsed = JSON.parse(bodyData);
          const updateRes = await fetchRestfulApi('/objects/' + id, 'PUT', {
            name: 'hipoteca_user_' + (parsed.account || 'ferjrm@hotmail.com'),
            data: parsed
          });
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ ok: true, remoteStatus: updateRes.status }));
        } catch (err) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ error: err.message }));
        }
      });
      return;
    }
  }

  // 3. Static Files
  let filePath = path.join(ROOT, reqPath === '/' ? 'index.html' : reqPath);
  const safePath = path.normalize(filePath);
  if (!safePath.startsWith(ROOT)) {
    res.writeHead(403);
    res.end('Forbidden');
    return;
  }

  if (!fs.existsSync(filePath) || fs.statSync(filePath).isDirectory()) {
    filePath = path.join(ROOT, 'index.html');
  }

  const ext = path.extname(filePath).toLowerCase();
  const contentType = MIME_TYPES[ext] || 'application/octet-stream';

  fs.readFile(filePath, (err, content) => {
    if (err) {
      res.writeHead(500, { 'Content-Type': 'text/plain' });
      res.end('Error loading ' + reqPath);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`Web application server active on port ${PORT}`);
});
