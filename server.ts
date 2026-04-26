import express from 'express';
import path from 'path';
import fs from 'fs/promises';
import session from 'express-session';
import cookieParser from 'cookie-parser';

const DB_PATH = path.join(process.cwd(), 'database.json');

async function getDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initialDB = { keys: [], blacklist: [] };
    await fs.writeFile(DB_PATH, JSON.stringify(initialDB, null, 2));
    return initialDB;
  }
}

async function saveDB(db: any) {
  await fs.writeFile(DB_PATH, JSON.stringify(db, null, 2));
}

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  // IMPORTANTE: Senha Padrão Inicial
  const SENHA_MESTRA_INICIAL = "Speed01!!01.";

  const db_data = await getDB();
  if (!db_data.keys || db_data.keys.length === 0) {
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);
    db_data.keys = [{
      id: '1',
      password: SENHA_MESTRA_INICIAL,
      expiresAt: expiresAt.getTime(),
      label: 'Acesso VIP Master'
    }];
    await saveDB(db_data);
  }

  app.use(express.json());
  app.use(cookieParser());
  app.set('trust proxy', 1);
  app.use(session({
    secret: 'speed-cards-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { secure: process.env.NODE_ENV === 'production', maxAge: 30 * 24 * 60 * 60 * 1000 }
  }));

  // ROTA DE LOGIN CORRIGIDA
  app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const db = await getDB();

    // Procura a senha exatamente como foi digitada
    const key = db.keys.find((k: any) => k.password === password);

    if (key) {
      if (Date.now() > key.expiresAt) {
        return res.status(403).json({ error: 'Esta senha expirou.' });
      }
      req.session.keyId = key.id;
      return res.json({ id: key.id, label: key.label, expiresAt: key.expiresAt });
    }
    
    res.status(401).json({ error: 'Senha inválida' });
  });

  // ROTA DE SINCRONIZAÇÃO (GERAR NOVA SENHA)
  app.post('/api/admin/sync-global-key', async (req, res) => {
    const { password } = req.body;
    const db = await getDB();
    
    db.keys = []; // Limpa as antigas
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 30);

    const newKey = {
      id: Date.now().toString(),
      password: password, // Salva o texto direto para não dar erro
      expiresAt: expiresAt.getTime(),
      label: 'Nova Chave Global'
    };

    db.keys.push(newKey);
    await saveDB(db);
    res.json({ success: true, key: password });
  });

  // Servir o Frontend
  const distPath = path.join(process.cwd(), 'dist');
  app.use(express.static(distPath));
  app.get('*', (req, res) => res.sendFile(path.join(distPath, 'index.html')));

  app.listen(Number(PORT), '0.0.0.0', () => console.log(`Rodando na porta ${PORT}`));
}

startServer();
