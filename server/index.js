
const path = require('path');
// Force load .env from the same directory as index.js
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
// Increased limit to 200mb to handle large PDF/Image uploads (Base64 adds ~33% overhead)
app.use(bodyParser.json({ limit: '200mb' }));
app.use(bodyParser.urlencoded({ limit: '200mb', extended: true }));

// Validate critical environment variables
if (!process.env.DB_USER) {
    console.error("CRITICAL ERROR: DB_USER is missing from environment variables.");
    console.error("Scanning for .env at: " + path.resolve(__dirname, '.env'));
}

const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'catequese_user',
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME || 'catequese_db',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  dateStrings: true,
  connectTimeout: 60000
};

console.log(`----------------------------------------------------------------`);
console.log(`Starting Server...`);
console.log(`DB Host: ${dbConfig.host}`);
console.log(`DB User: ${dbConfig.user}`);
console.log(`DB Name: ${dbConfig.database}`);
console.log(`DB Password Configured: ${dbConfig.password ? 'YES (Length: ' + dbConfig.password.length + ')' : 'NO'}`);
console.log(`----------------------------------------------------------------`);

const pool = mysql.createPool(dbConfig);

// Database Auto-Migration Function
const runMigrations = async () => {
    let conn;
    try {
        conn = await pool.getConnection();
        
        // Migration 1: linked_catequista_id in users
        const [columnsUsers] = await conn.query("SHOW COLUMNS FROM users LIKE 'linked_catequista_id'");
        if (columnsUsers.length === 0) {
            console.log("⚠️ Migration Required: Adding 'linked_catequista_id' to 'users' table...");
            await conn.query("ALTER TABLE users ADD COLUMN linked_catequista_id VARCHAR(50)");
            console.log("✅ Migration Successful: Column added to users.");
        }

        // Migration 2: turma_id in gallery
        const [columnsGallery] = await conn.query("SHOW COLUMNS FROM gallery LIKE 'turma_id'");
        if (columnsGallery.length === 0) {
            console.log("⚠️ Migration Required: Adding 'turma_id' to 'gallery' table...");
            await conn.query("ALTER TABLE gallery ADD COLUMN turma_id VARCHAR(50)");
            console.log("✅ Migration Successful: Column added to gallery.");
        } else {
            console.log("✅ Database Schema Check: 'gallery' table is up to date.");
        }

        // Migration 3: niveis_etapas table
        try {
            await conn.query(`
                CREATE TABLE IF NOT EXISTS niveis_etapas (
                    id VARCHAR(50) PRIMARY KEY,
                    nome VARCHAR(255) NOT NULL,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            `);
            console.log("✅ Database Schema Check: 'niveis_etapas' table is ready.");
        } catch (e) {
            console.error("❌ Failed to create 'niveis_etapas' table:", e.message);
        }
        
        // Migration 4: comunidade in turmas
        const [columnsTurmas] = await conn.query("SHOW COLUMNS FROM turmas LIKE 'comunidade'");
        if (columnsTurmas.length === 0) {
            console.log("⚠️ Migration Required: Adding 'comunidade' to 'turmas' table...");
            await conn.query("ALTER TABLE turmas ADD COLUMN comunidade VARCHAR(255)");
            console.log("✅ Migration Successful: Column added to turmas.");
        }

    } catch (err) {
        console.error("❌ Migration Failed:", err.message);
        // Don't crash, purely log the error as it might be a connection issue handled later
    } finally {
        if (conn) conn.release();
    }
};

// Test Connection and Run Migrations Immediately
pool.getConnection()
    .then(conn => {
        console.log("✅ Database connected successfully!");
        conn.release();
        runMigrations(); // Run migration check
    })
    .catch(err => {
        console.error("❌ Database connection FAILED:", err.message);
        console.error("Error Code:", err.code);
    });

const ALLOWED_TABLES = ['users', 'turmas', 'catequistas', 'students', 'attendance_sessions', 'events', 'gallery', 'library', 'formations', 'parish_config', 'niveis_etapas'];

const parseRow = (row) => {
  if (!row) return row;
  const newRow = { ...row };
  
  if (newRow.full_data) {
    try {
      const fullData = typeof newRow.full_data === 'string' ? JSON.parse(newRow.full_data) : newRow.full_data;
      Object.assign(newRow, fullData);
    } catch (e) {
      console.warn("Failed to parse full_data", e);
    }
    delete newRow.full_data;
  }

  ['permissions', 'entries', 'config_json', 'presentes'].forEach(field => {
    if (newRow[field] && typeof newRow[field] === 'string') {
      try { newRow[field] = JSON.parse(newRow[field]); } catch(e) {}
    }
  });

  // Handle camelCase conversion for specific fields if needed, or rely on Frontend to match DB
  if (newRow.linked_catequista_id !== undefined) {
      newRow.linkedCatequistaId = newRow.linked_catequista_id;
      delete newRow.linked_catequista_id;
  }
  if (newRow.turma_id !== undefined) {
      newRow.turmaId = newRow.turma_id;
      delete newRow.turma_id;
  }

  if (newRow.config_json) return newRow.config_json;

  return newRow;
};

// Health Check
app.get('/', (req, res) => {
    res.json({ status: 'API Online', timestamp: new Date(), db_user: dbConfig.user });
});

// GET ALL
app.get('/api/:resource', async (req, res) => {
  try {
    const { resource } = req.params;
    
    if (resource === 'parish_config') {
      try {
          const [rows] = await pool.query('SELECT * FROM parish_config LIMIT 1');
          if (rows.length === 0) return res.json({});
          return res.json(parseRow(rows[0]));
      } catch (tableErr) {
          if (tableErr.code === 'ER_NO_SUCH_TABLE') {
              console.warn("Table parish_config missing. Returning empty object.");
              return res.json({});
          }
          throw tableErr;
      }
    }

    if (!ALLOWED_TABLES.includes(resource)) return res.status(400).json({ error: 'Invalid resource' });

    const [rows] = await pool.query(`SELECT * FROM ${resource}`);
    res.json(rows.map(parseRow));
  } catch (err) {
    console.error(`Error fetching ${req.params.resource}:`, err);
    res.status(500).json({ 
        error: "Database Error", 
        message: err.message, 
        code: err.code, 
        sqlState: err.sqlState 
    });
  }
});

// POST (Create)
app.post('/api/:resource', async (req, res) => {
  const { resource } = req.params;
  const data = req.body;

  if (resource === 'parish_config') {
    try {
        await pool.query('DELETE FROM parish_config');
        await pool.query('INSERT INTO parish_config (config_json) VALUES (?)', [JSON.stringify(data)]);
        return res.json({ success: true });
    } catch (err) { return res.status(500).json({ error: err.message }); }
  }

  if (!ALLOWED_TABLES.includes(resource)) return res.status(400).send('Invalid resource');

  try {
    if (!data.id) data.id = Math.random().toString(36).substr(2, 9);

    let query = '';
    let params = [];
    const json = (v) => JSON.stringify(v || {});

    switch (resource) {
      case 'users':
        query = 'INSERT INTO users (id, nome, email, senha, role, permissions, linked_catequista_id) VALUES (?, ?, ?, ?, ?, ?, ?)';
        params = [data.id, data.nome, data.email, data.senha, data.role, json(data.permissions), data.linkedCatequistaId || null];
        break;
      case 'turmas':
        query = 'INSERT INTO turmas (id, nome, nivel, catequista, dia_semana, horario, ano, ativa, comunidade) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)';
        params = [data.id, data.nome, data.nivel, data.catequista, data.diaSemana, data.horario, data.ano, data.ativa, data.comunidade || null];
        break;
      case 'students':
        query = 'INSERT INTO students (id, matricula, nome_completo, turma_id, status, data_nascimento, sexo, telefone, batizado, fez_primeira_eucaristia, full_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        params = [data.id, data.matricula, data.nomeCompleto, null, data.status, data.dataNascimento || null, data.sexo, data.telefone, data.batizado, data.fezPrimeiraEucaristia, json(data)];
        break;
      case 'catequistas':
        query = 'INSERT INTO catequistas (id, nome, status, sexo, data_nascimento, rg_cpf, comunidade, telefone, whatsapp, email, full_data) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)';
        params = [data.id, data.nome, data.status, data.sexo, data.dataNascimento || null, data.rgCpf, data.comunidade, data.telefone, data.whatsapp, data.email, json(data)];
        break;
      case 'attendance_sessions':
        query = 'INSERT INTO attendance_sessions (id, turma_id, date, tema, entries) VALUES (?, ?, ?, ?, ?)';
        params = [data.id, data.turmaId, data.date, data.tema, json(data.entries)];
        break;
      case 'events':
        query = 'INSERT INTO events (id, titulo, data_inicio, data_fim, tipo, full_data) VALUES (?, ?, ?, ?, ?, ?)';
        params = [data.id, data.titulo, data.dataInicio, data.dataFim, data.tipo, json(data)];
        break;
      case 'formations':
        query = 'INSERT INTO formations (id, tema, inicio, fim, presentes, full_data) VALUES (?, ?, ?, ?, ?, ?)';
        params = [data.id, data.tema, data.inicio, data.fim, json(data.presentes), json(data)];
        break;
      case 'gallery':
        query = 'INSERT INTO gallery (id, title, url, date, turma_id) VALUES (?, ?, ?, ?, ?)';
        params = [data.id, data.title, data.url, data.date, data.turmaId || null];
        break;
      case 'library':
        query = 'INSERT INTO library (id, name, category, url, type, upload_date) VALUES (?, ?, ?, ?, ?, ?)';
        params = [data.id, data.name, data.category, data.url, data.type, data.upload_date];
        break;
      case 'niveis_etapas':
        query = 'INSERT INTO niveis_etapas (id, nome) VALUES (?, ?)';
        params = [data.id, data.nome];
        break;
    }

    if (query) {
      await pool.query(query, params);
      res.json({ success: true, id: data.id });
    } else {
      res.status(400).send('Table not mapped');
    }
  } catch (err) {
    console.error(`Error creating in ${req.params.resource}:`, err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// PUT (Update)
app.put('/api/:resource/:id', async (req, res) => {
  const { resource, id } = req.params;
  const data = req.body;

  if (!ALLOWED_TABLES.includes(resource)) return res.status(400).send('Invalid resource');

  try {
    let query = '';
    let params = [];
    const json = (v) => JSON.stringify(v || {});

    switch (resource) {
        case 'users':
          query = 'UPDATE users SET nome=?, email=?, senha=?, role=?, permissions=?, linked_catequista_id=? WHERE id=?';
          params = [data.nome, data.email, data.senha, data.role, json(data.permissions), data.linkedCatequistaId || null, id];
          break;
        case 'turmas':
          query = 'UPDATE turmas SET nome=?, nivel=?, catequista=?, dia_semana=?, horario=?, ano=?, ativa=?, comunidade=? WHERE id=?';
          params = [data.nome, data.nivel, data.catequista, data.diaSemana, data.horario, data.ano, data.ativa, data.comunidade || null, id];
          break;
        case 'students':
          query = 'UPDATE students SET matricula=?, nome_completo=?, status=?, data_nascimento=?, sexo=?, telefone=?, batizado=?, fez_primeira_eucaristia=?, full_data=? WHERE id=?';
          params = [data.matricula, data.nomeCompleto, data.status, data.dataNascimento || null, data.sexo, data.telefone, data.batizado, data.fezPrimeiraEucaristia, json(data), id];
          break;
        case 'catequistas':
          query = 'UPDATE catequistas SET nome=?, status=?, sexo=?, data_nascimento=?, rg_cpf=?, comunidade=?, telefone=?, whatsapp=?, email=?, full_data=? WHERE id=?';
          params = [data.nome, data.status, data.sexo, data.dataNascimento || null, data.rgCpf, data.comunidade, data.telefone, data.whatsapp, data.email, json(data), id];
          break;
        case 'attendance_sessions':
          query = 'UPDATE attendance_sessions SET date=?, tema=?, entries=? WHERE id=?';
          params = [data.date, data.tema, json(data.entries), id];
          break;
        case 'events':
          query = 'UPDATE events SET titulo=?, data_inicio=?, data_fim=?, tipo=?, full_data=? WHERE id=?';
          params = [data.titulo, data.dataInicio, data.dataFim, data.tipo, json(data), id];
          break;
        case 'formations':
          query = 'UPDATE formations SET tema=?, inicio=?, fim=?, presentes=?, full_data=? WHERE id=?';
          params = [data.tema, data.inicio, data.fim, json(data.presentes), json(data), id];
          break;
        case 'gallery':
          query = 'UPDATE gallery SET title=?, url=?, date=?, turma_id=? WHERE id=?';
          params = [data.title, data.url, data.date, data.turmaId || null, id];
          break;
        case 'niveis_etapas':
          query = 'UPDATE niveis_etapas SET nome=? WHERE id=?';
          params = [data.nome, id];
          break;
    }

    if (query) {
        await pool.query(query, params);
        res.json({ success: true });
    } else {
        res.status(400).send('Update not mapped');
    }
  } catch (err) {
    console.error(`Error updating ${req.params.resource}:`, err);
    res.status(500).json({ error: err.message, code: err.code });
  }
});

// DELETE
app.delete('/api/:resource/:id', async (req, res) => {
    const { resource, id } = req.params;
    if (!ALLOWED_TABLES.includes(resource)) return res.status(400).send('Invalid resource');
    
    try {
        await pool.query(`DELETE FROM ${resource} WHERE id = ?`, [id]);
        res.json({ success: true });
    } catch (err) {
        console.error(`Error deleting from ${req.params.resource}:`, err);
        res.status(500).json({ error: err.message, code: err.code });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
