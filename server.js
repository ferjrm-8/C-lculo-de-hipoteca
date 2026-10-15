const http = require('http');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const PORT = 3000;
const ROOT = process.cwd();
const DATA_DIR = path.join(ROOT, 'data');
const DB_FILE = path.join(DATA_DIR, 'database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

function hashPassword(pwd) {
  if (!pwd) return '';
  return crypto.createHash('sha256').update(String(pwd).trim().toLowerCase()).digest('hex');
}

function normalizeUser(str) {
  if (!str) return '';
  let s = String(str).trim().toLowerCase();
  return s;
}

// Initial seed mortgage data
function getInitialFerjrmData() {
  return {
    account: 'ferjrm@hotmail.com',
    settings: {
      initialCapital: 180000,
      totalTermYears: 25,
      annualInterestRate: 2.50,
      coOwner1Name: '1º Propietario',
      coOwner2Name: '2º Propietario',
      coOwner1Percentage: 50.00,
      coOwner2Percentage: 50.00,
      internalDebtOwner1: 0,
      internalDebtOwner2: 0
    },
    revisions: [
      { id: 1, name: 'Revisión Inicial', feeTotal: 600, rate: 2.5, euribor: 0, spread: 2.5, date: '2024-01' }
    ],
    payments: []
  };
}

// In-memory Database state with atomic file persistence
let db = {
  users: {},
  aliases: {}
};

function initDatabase() {
  if (fs.existsSync(DB_FILE)) {
    try {
      const content = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(content);
      if (!db.users) db.users = {};
      if (!db.aliases) db.aliases = {};
    } catch (e) {
      console.error('Error loading db file, reinitializing:', e.message);
    }
  }

  // Ensure default user exists
  const defaultEmail = 'ferjrm@hotmail.com';
  if (!db.users[defaultEmail]) {
    db.users[defaultEmail] = {
      email: defaultEmail,
      username: 'ferjrm',
      passwordHash: hashPassword('raquel'),
      plainPwd: 'raquel',
      revision: 1,
      updatedAt: Date.now(),
      data: getInitialFerjrmData()
    };
  }
  // Register aliases for ferjrm
  db.aliases['ferjrm'] = defaultEmail;
  db.aliases['ferjrm@gmail.com'] = defaultEmail;
  db.aliases['raquel'] = defaultEmail;

  saveDatabaseSync();
}

function saveDatabaseSync() {
  try {
    const tmp = DB_FILE + '.tmp';
    fs.writeFileSync(tmp, JSON.stringify(db, null, 2), 'utf8');
    fs.renameSync(tmp, DB_FILE);
  } catch (e) {
    console.error('Database write error:', e.message);
  }
}

initDatabase();

function resolveUser(raw) {
  const norm = normalizeUser(raw);
  if (!norm) return null;
  if (db.users[norm]) return { key: norm, user: db.users[norm] };
  if (db.aliases[norm] && db.users[db.aliases[norm]]) {
    const target = db.aliases[norm];
    return { key: target, user: db.users[target] };
  }
  // Check if prefix matches any email username
  for (const k of Object.keys(db.users)) {
    if (k.split('@')[0] === norm) {
      return { key: k, user: db.users[k] };
    }
  }
  return null;
}

function verifyPassword(inputPwd, userRecord) {
  if (!userRecord) return false;
  if (!inputPwd && !userRecord.passwordHash && !userRecord.plainPwd) return true;
  const trimmed = String(inputPwd || '').trim();
  const hash = hashPassword(trimmed);
  if (userRecord.plainPwd && trimmed.toLowerCase() === userRecord.plainPwd.toLowerCase()) return true;
  if (userRecord.passwordHash && hash === userRecord.passwordHash) return true;
  if (userRecord.passwordHash && trimmed === userRecord.passwordHash) return true;
  return false;
}

// SSE Connection Management for True Real-Time Multi-Device Sync
const sseSubscribers = new Map(); // Map<userKey, Set<http.ServerResponse>>

function addSseSubscriber(userKey, res) {
  if (!sseSubscribers.has(userKey)) {
    sseSubscribers.set(userKey, new Set());
  }
  sseSubscribers.get(userKey).add(res);
}

function removeSseSubscriber(userKey, res) {
  if (sseSubscribers.has(userKey)) {
    const set = sseSubscribers.get(userKey);
    set.delete(res);
    if (set.size === 0) sseSubscribers.delete(userKey);
  }
}

function broadcastUserUpdate(userKey, senderRes = null) {
  const subscribers = sseSubscribers.get(userKey);
  if (!subscribers || subscribers.size === 0) return;

  const resolved = resolveUser(userKey);
  if (!resolved) return;

  const payload = JSON.stringify({
    event: 'state_updated',
    user: resolved.key,
    revision: resolved.user.revision,
    updatedAt: resolved.user.updatedAt,
    data: resolved.user.data
  });

  for (const client of subscribers) {
    if (client === senderRes) continue; // Skip sender if desired, or notify all
    try {
      client.write(`event: state_updated\ndata: ${payload}\n\n`);
    } catch (e) {
      subscribers.delete(client);
    }
  }
}

// Keep-alive heartbeat every 20 seconds for SSE connections
setInterval(() => {
  for (const [key, clients] of sseSubscribers.entries()) {
    for (const client of clients) {
      try {
        client.write(':ping\n\n');
      } catch (e) {
        clients.delete(client);
      }
    }
  }
}, 20000);

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

function readBodyJson(req) {
  return new Promise((resolve, reject) => {
    let body = '';
    req.on('data', chunk => body += chunk);
    req.on('end', () => {
      try {
        resolve(body ? JSON.parse(body) : {});
      } catch (e) {
        reject(new Error('Invalid JSON format'));
      }
    });
    req.on('error', err => reject(err));
  });
}

function sendJson(res, statusCode, data) {
  res.writeHead(statusCode, {
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache, no-store, must-revalidate',
    'Access-Control-Allow-Origin': '*'
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  // Global CORS & caching headers
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
  const pathname = urlObj.pathname;

  // 1. Health check
  if (pathname === '/api/health') {
    sendJson(res, 200, { status: 'ok', time: Date.now() });
    return;
  }

  // 2. Real-Time Server-Sent Events (SSE) Stream
  if (pathname === '/api/events') {
    const rawUser = urlObj.searchParams.get('user') || '';
    const resolved = resolveUser(rawUser);
    const userKey = resolved ? resolved.key : normalizeUser(rawUser);

    if (!userKey) {
      sendJson(res, 400, { error: 'Missing user identifier' });
      return;
    }

    res.writeHead(200, {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'Access-Control-Allow-Origin': '*'
    });
    res.write(`:connected\n\n`);

    addSseSubscriber(userKey, res);

    req.on('close', () => {
      removeSseSubscriber(userKey, res);
    });
    return;
  }

  // 3. Auth API: Register Unique User
  if (pathname === '/api/auth/register' && req.method === 'POST') {
    try {
      const body = await readBodyJson(req);
      const email = normalizeUser(body.email || body.username || '');
      const pwd = String(body.password || '').trim();

      if (!email) {
        sendJson(res, 400, { error: 'Se requiere un correo o nombre de usuario válido' });
        return;
      }
      if (resolveUser(email)) {
        sendJson(res, 409, { error: `La cuenta "${email}" ya existe. Inicia sesión con tu contraseña.` });
        return;
      }

      const initialData = body.initialData || getInitialFerjrmData();
      initialData.account = email;

      const newUser = {
        email: email,
        username: email.includes('@') ? email.split('@')[0] : email,
        passwordHash: hashPassword(pwd),
        plainPwd: pwd,
        revision: 1,
        updatedAt: Date.now(),
        data: initialData
      };

      db.users[email] = newUser;
      if (newUser.username !== email) {
        db.aliases[newUser.username] = email;
      }
      saveDatabaseSync();

      sendJson(res, 201, {
        ok: true,
        user: email,
        revision: newUser.revision,
        data: newUser.data,
        message: 'Usuario creado y registrado en la nube con éxito'
      });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // 4. Auth API: Login
  if (pathname === '/api/auth/login' && req.method === 'POST') {
    try {
      const body = await readBodyJson(req);
      const rawUser = body.email || body.username || '';
      const pwd = body.password || '';

      const resolved = resolveUser(rawUser);
      if (!resolved) {
        const available = Object.keys(db.users);
        sendJson(res, 404, {
          error: `Esta cuenta no existe en la nube. Cuentas disponibles: ${available.join(', ')}`,
          availableUsers: available
        });
        return;
      }

      const { key, user } = resolved;
      if (user.passwordHash || user.plainPwd) {
        if (!verifyPassword(pwd, user)) {
          sendJson(res, 401, {
            error: 'Contraseña incorrecta. Utiliza "Restablecer Contraseña" si la has olvidado.'
          });
          return;
        }
      }

      sendJson(res, 200, {
        ok: true,
        user: key,
        revision: user.revision,
        updatedAt: user.updatedAt,
        data: user.data,
        message: 'Sesión iniciada correctamente'
      });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // 5. Auth API: Reset Password
  if (pathname === '/api/auth/reset-password' && req.method === 'POST') {
    try {
      const body = await readBodyJson(req);
      const rawUser = body.email || body.username || '';
      const newPwd = String(body.newPassword || '').trim();

      const resolved = resolveUser(rawUser);
      if (!resolved) {
        sendJson(res, 404, { error: 'La cuenta no existe en la nube.' });
        return;
      }

      resolved.user.passwordHash = hashPassword(newPwd);
      resolved.user.plainPwd = newPwd;
      resolved.user.updatedAt = Date.now();
      saveDatabaseSync();

      sendJson(res, 200, {
        ok: true,
        user: resolved.key,
        message: 'Contraseña restablecida con éxito'
      });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // 6. Auth API: Delete Account
  if (pathname === '/api/auth/delete-account' && req.method === 'POST') {
    try {
      const body = await readBodyJson(req);
      const rawUser = body.email || body.username || '';
      const resolved = resolveUser(rawUser);

      if (!resolved) {
        sendJson(res, 404, { error: 'La cuenta no existe en la nube.' });
        return;
      }

      delete db.users[resolved.key];
      for (const [alias, target] of Object.entries(db.aliases)) {
        if (target === resolved.key) delete db.aliases[alias];
      }
      saveDatabaseSync();

      sendJson(res, 200, { ok: true, message: 'Cuenta eliminada de la nube' });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // 7. User Data: GET (Fetch latest cloud state)
  if ((pathname === '/api/user_data' || pathname === '/api/user/data') && req.method === 'GET') {
    const rawUser = urlObj.searchParams.get('user') || urlObj.searchParams.get('id') || urlObj.searchParams.get('account') || 'ferjrm@hotmail.com';
    const resolved = resolveUser(rawUser);

    if (!resolved) {
      sendJson(res, 404, { error: 'Usuario no encontrado en la nube', user: rawUser });
      return;
    }

    sendJson(res, 200, {
      account: resolved.key,
      revision: resolved.user.revision,
      updatedAt: resolved.user.updatedAt,
      settings: resolved.user.data.settings || {},
      revisions: resolved.user.data.revisions || [],
      payments: resolved.user.data.payments || []
    });
    return;
  }

  // 8. User Data: POST/PUT (Save state & broadcast in real-time)
  if ((pathname === '/api/user_data' || pathname === '/api/user/data') && (req.method === 'POST' || req.method === 'PUT')) {
    try {
      const payload = await readBodyJson(req);
      const rawUser = payload.account || urlObj.searchParams.get('user') || 'ferjrm@hotmail.com';
      const resolved = resolveUser(rawUser);

      let targetUser = resolved ? resolved.user : null;
      let targetKey = resolved ? resolved.key : normalizeUser(rawUser);

      if (!targetUser) {
        // Auto-create user if not found
        targetUser = {
          email: targetKey,
          username: targetKey.includes('@') ? targetKey.split('@')[0] : targetKey,
          passwordHash: hashPassword('raquel'),
          plainPwd: 'raquel',
          revision: 1,
          updatedAt: Date.now(),
          data: {}
        };
        db.users[targetKey] = targetUser;
      }

      targetUser.revision = (targetUser.revision || 0) + 1;
      targetUser.updatedAt = Date.now();
      targetUser.data = {
        account: targetKey,
        settings: payload.settings || targetUser.data.settings || {},
        revisions: payload.revisions || targetUser.data.revisions || [],
        payments: payload.payments || targetUser.data.payments || []
      };

      saveDatabaseSync();

      // Broadcast to all other sessions in real time!
      broadcastUserUpdate(targetKey);

      sendJson(res, 200, {
        ok: true,
        revision: targetUser.revision,
        updatedAt: targetUser.updatedAt,
        message: 'Guardado y sincronizado en tiempo real'
      });
    } catch (e) {
      sendJson(res, 500, { error: e.message });
    }
    return;
  }

  // 9. Registry API: List available cloud accounts
  if (pathname === '/api/registry') {
    const usersList = Object.values(db.users).map(u => ({
      email: u.email,
      username: u.username,
      objectId: u.email,
      pwd: u.plainPwd || '',
      passwordHash: u.passwordHash,
      revision: u.revision,
      updatedAt: u.updatedAt
    }));

    sendJson(res, 200, {
      users: usersList,
      updatedAt: Date.now()
    });
    return;
  }

  // 10. Static File Serving (HTML, JS, CSS, Assets)
  let filePath = path.join(ROOT, pathname === '/' ? 'index.html' : pathname);
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
      res.end('Error loading ' + pathname);
      return;
    }
    res.writeHead(200, {
      'Content-Type': contentType,
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Pragma': 'no-cache',
      'Expires': '0'
    });
    res.end(content);
  });
});

server.listen(PORT, '0.0.0.0', () => {
  console.log(`[Cloud Engine] Realtime multi-device server running at http://0.0.0.0:${PORT}`);
});
