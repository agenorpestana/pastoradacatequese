
const path = require('path');
// Force load .env from the same directory as index.js
require('dotenv').config({ path: path.resolve(__dirname, '.env') });

const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
app.use(bodyParser.json({ limit: '50mb' }));

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

// Test Connection Immediately
pool.getConnection()
    .then(conn => {
        console.log("✅ Database connected successfully!");
        conn.release();
    })
    .catch(err => {
        console.error("❌ Database connection FAILED:", err.message);
        console.error("Error Code:", err.code);
    });

const ALLOWED_TABLES = ['users', 'turmas', 'catequistas', 'students', 'attendance_sessions', 'events', 'gallery', 'library', 'formations', 'parish_config'];

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
      const [rows] = await pool.query('SELECT * FROM parish_config LIMIT 1');
      if (rows.length === 0) return res.json({});
      return res.json(parseRow(rows[0]));
    }

    if (!ALLOWED_TABLES.includes(resource)) return res.status(400).json({ error: 'Invalid resource' });

    const [rows] = await pool.query(`SELECT * FROM ${resource}`);
    res.json(rows.map(parseRow));
  } catch (err) {
    console.error(`Error fetching ${req.params.resource}:`, err);
    res.status(500).json({ 
        error: err.message, 
        details: "Check server logs for DB connection errors." 
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
    } catch (err) { return res.status(500).json(err); }
  }

  if (!ALLOWED_TABLES.includes(resource)) return res.status(400).send('Invalid resource');

  try {
    if (!data.id) data.id = Math.random().toString(36).substr(2, 9);

    let query = '';
    let params = [];
    const json = (v) => JSON.stringify(v || {});

    switch (resource) {
      case 'users':
        query = 'INSERT INTO users (id, nome, email, senha, role, permissions) VALUES (?, ?, ?, ?, ?, ?)';
        params = [data.id, data.nome, data.email, data.senha, data.role, json(data.permissions)];
        break;
      case 'turmas':
        query = 'INSERT INTO turmas (id, nome, nivel, catequista, dia_semana, horario, ano, ativa) VALUES (?, ?, ?, ?, ?, ?, ?, ?)';
        params = [data.id, data.nome, data.nivel, data.catequista, data.diaSemana, data.horario, data.ano, data.ativa];
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
        query = 'INSERT INTO gallery (id, title, url, date) VALUES (?, ?, ?, ?)';
        params = [data.id, data.title, data.url, data.date];
        break;
      case 'library':
        query = 'INSERT INTO library (id, name, category, url, type, upload_date) VALUES (?, ?, ?, ?, ?, ?)';
        params = [data.id, data.name, data.category, data.url, data.type, data.upload_date];
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
    res.status(500).json({ error: err.message });
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
          query = 'UPDATE users SET nome=?, email=?, senha=?, role=?, permissions=? WHERE id=?';
          params = [data.nome, data.email, data.senha, data.role, json(data.permissions), id];
          break;
        case 'turmas':
          query = 'UPDATE turmas SET nome=?, nivel=?, catequista=?, dia_semana=?, horario=?, ano=?, ativa=? WHERE id=?';
          params = [data.nome, data.nivel, data.catequista, data.diaSemana, data.horario, data.ano, data.ativa, id];
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
    }

    if (query) {
        await pool.query(query, params);
        res.json({ success: true });
    } else {
        res.status(400).send('Update not mapped');
    }
  } catch (err) {
    console.error(`Error updating ${req.params.resource}:`, err);
    res.status(500).json({ error: err.message });
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
        res.status(500).json({ error: err.message });
    }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
