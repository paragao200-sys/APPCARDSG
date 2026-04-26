import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import fs from 'fs/promises';
import session from 'express-session';
import cookieParser from 'cookie-parser';
import bcrypt from 'bcryptjs';

// Implementação do Banco de Dados JSON
const DB_PATH = path.join(process.cwd(), 'database.json');

async function getDB() {
  try {
    const data = await fs.readFile(DB_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    const initialDB = { keys: [], client_data: [], blacklist: [] };
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
  
  // Porta dinâmica obrigatória para o Railway
  const PORT = process.env.PORT || 3000;

  console.log('Server: Iniciando configuração...');

  // Inicializa o banco com uma chave padrão se estiver vazio
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

  app.use(express.json());
  app.use(cookieParser());
  
  // Configuração para o Railway (HTTPS Proxy)
  app.set('trust proxy', 1); 
  
  app.use(session({
    secret: 'speed-cards-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { 
      secure: process.env.NODE_ENV === 'production', 
      maxAge: 30 * 24 * 60 * 60 * 1000 
    }
  }));

  // Middlewares e Rotas de API
  app.post('/api/login', async (req, res) => {
    const { password } = req.body;
    const db = await getDB();

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

  app.get('/api/me', async (req, res) => {
    if (!req.session.keyId) return res.status(401).json({ error: 'Not logged in' });
    const db = await getDB();
    const key = db.keys.find((k: any) => k.id === req.session.keyId);
    if (!key || Date.now() > key.expiresAt) {
      req.session.destroy(() => {});
      return res.status(401).json({ error: 'Sessão expirada' });
    }
    res.json(key);
  });

  app.get('/cad', (req, res) => {
    res.redirect('https://go.aff.casadeapostas.bet.br/jg6y1exs'); 
  });

  // CONFIGURAÇÃO DE ENTREGA DO SITE (FRONTEND)
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    // 1. Serve os arquivos estáticos (CSS, JS, Imagens)
    app.use(express.static(distPath));
    
    // 2. Rota que entrega o site propriamente dito
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  // Inicia o servidor em 0.0.0.0
  app.listen(Number(PORT), '0.0.0.0', () => {
    console.log(`Servidor rodando com sucesso na porta ${PORT}`);
  });
}

startServer();
