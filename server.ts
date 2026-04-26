import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

// Simple JSON Database Implementation
const DB_PATH = path.join(process.cwd(), 'database.json');

async function getDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initialDB = { keys: [], client_data: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
}

async function saveDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

declare module 'express-session' {
  interface SessionData {
    keyId: string;
  }
}

async function startServer() {
  const app = express();
  const PORT = 3000;

  console.log('Server: Initialization started...');

  // Initialize DB with a default 30-day key if empty
  const db_data = await getDB();
  if (!db_data.keys || db_data.keys.length === 0) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    
    db_data.keys = [
      {
        id: '1',
        password: bcrypt.hashSync('Speed01!!01.', 10),
        expiresAt: expiresAt.getTime(),
        label: 'Acesso VIP 30 Dias'
      }
    ];
    await saveDB(db_data);
  }

  console.log('Server: Database (JSON) ready.');

  app.use(express.json());
  app.use(cookieParser());
  app.use(session({
    secret: 'speed-cards-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: false, maxAge: 30 * 24 * 60 * 60 * 1000 } // 30 days session
  }));

  const authenticate = (req: any, res: any, next: any) => {
    if (req.session.keyId) {
      next();
    } else {
      res.status(401).json({ error: 'Unauthorized' });
    }
  };

  // Admin API to sync a new global key
  app.post('/api/admin/sync-global-key', async (req, res) => {
    // In a real app, we'd verify admin session here.
    const { password } = req.body;
    if (!password) return res.status(400).json({ error: 'Password required' });

    const db = await getDB();
    
    // Hard Reset Logic:
    // 1. Invalidate Immediately: Move current keys to blacklist
    if (!db.blacklist) db.blacklist = [];
    db.keys.forEach((k: any) => {
      // Avoid duplicates in blacklist
      if (!db.blacklist.includes(k.password)) {
        db.blacklist.push(k.password);
      }
    });

    // 2. Clear current keys (Global Sync - This effectively logs out sessions on next check)
    db.keys = [];

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newKey = {
      id: Date.now().toString(),
      password: bcrypt.hashSync(password, 10),
      expiresAt: expiresAt.getTime(),
      label: 'Acesso Sincronizado Global'
    };

    db.keys.push(newKey);
    await saveDB(db);

    res.json({ success: true, key: { ...newKey, password: 'HIDDEN' } });
  });

  app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const db = await getDB();

    // Check Blacklist first (Block Rollback)
    // Since blacklist contains hashes, we need to compare incoming password against each
    if (db.blacklist && db.blacklist.some((hash: string) => bcrypt.compareSync(password, hash))) {
      return res.status(403).json({ error: 'Token Expirado - Gere um novo acesso' });
    }

    const key = db.keys.find((k: any) => bcrypt.compareSync(password, k.password));

    if (key) {
      const now = Date.now();
      if (now > key.expiresAt) {
        return res.status(403).json({ error: 'Esta senha expirou.' });
      }
      req.session.keyId = key.id;
      res.json({ id: key.id, label: key.label, expiresAt: key.expiresAt });
    } else {
      res.status(401).json({ error: 'Senha inválida' });
    }
  });

  app.post('/api/logout', (req, res) => {
    req.session.destroy(() => {
      res.json({ success: true });
    });
  });

  app.get('/api/me', async (req, res) => {
    if (!req.session.keyId) return res.status(401).json({ error: 'Not logged in' });
    const db = await getDB();
    const key = db.keys.find((k: any) => k.id === req.session.keyId);
    if (!key || Date.now() > key.expiresAt) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Session expired' });
    }
    res.json(key);
  });

  // Support registration of new keys for demo purposes
  app.post('/api/register', async (req, res) => {
    const { password } = req.body;
    const db = await getDB();
    
    if (db.keys.find((k: any) => k.password === password)) {
      return res.status(400).json({ error: 'Esta senha já existe.' });
    }

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newKey = {
      id: Date.now().toString(),
      password,
      expiresAt: expiresAt.getTime(),
      label: 'Novo Acesso 30 Dias'
    };
    
    db.keys.push(newKey);
    await saveDB(db);
    
    req.session.keyId = newKey.id;
    res.json(newKey);
  });

  app.post('/api/data', authenticate, async (req, res) => {
    const { title, value, category } = req.body;
    const db = await getDB();
    
    const newData = {
      id: Date.now(),
      key_id: req.session.keyId,
      title,
      value,
      category
    };
    
    db.client_data.push(newData);
    await saveDB(db);
    res.json(newData);
  });

  app.delete('/api/data/:id', authenticate, async (req, res) => {
    const { id } = req.params;
    const db = await getDB();
    
    db.client_data = db.client_data.filter(
      (d: any) => !(d.id === Number(id) && d.key_id === req.session.keyId)
    );
    
    await saveDB(db);
    res.json({ success: true });
  });

  // Redirect route for "Plataforma" button
  app.get('/cad', (req, res) => {
    // User can replace this with their actual affiliate/platform URL
    const destinationUrl = 'https://go.aff.casadeapostas.bet.br/jg6y1exs'; 
    res.redirect(destinationUrl);
  });

  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
