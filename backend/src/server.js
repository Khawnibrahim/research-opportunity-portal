require('dotenv').config();
const express = require('express');
const cors = require('cors');
const db = require('./db');
const app = express();
const allowedOrigins = new Set([
  process.env.CLIENT_ORIGIN || 'http://localhost:5173',
  'http://localhost:5173',
  'http://127.0.0.1:5173',
  'http://localhost:5174',
  'http://127.0.0.1:5174',
]);
app.use(cors({ origin: (origin, cb) => cb(null, !origin || allowedOrigins.has(origin)) }));
app.use(express.json());
app.use((req, res, next) => {
  if (['POST', 'PUT'].includes(req.method) &&
      (!req.body || typeof req.body !== 'object' || Array.isArray(req.body))) {
    return res.status(400).json({ message: 'Request body must be a JSON object' });
  }
  next();
});

const fields = ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills', 'available_positions', 'application_deadline', 'status'];
const selectFields = 'id, title, description, research_area, faculty_name, department, required_skills, available_positions, application_deadline, status, created_at, updated_at';

function validate(body) {
  const errors = [];
  for (const name of fields.slice(0, 8)) {
    if (body[name] === undefined || body[name] === null || body[name] === '') errors.push(`${name} is required`);
  }
  for (const key of ['title', 'description', 'research_area', 'faculty_name', 'department', 'required_skills']) {
    if (body[key] !== undefined && (typeof body[key] !== 'string' || !body[key].trim())) errors.push(`${key} must be non-empty text`);
  }
  for (const [key, max] of Object.entries({title:200,research_area:120,faculty_name:120,department:120})) {
    if (typeof body[key] === 'string' && body[key].length > max) errors.push(`${key} must be at most ${max} characters`);
  }
  if (body.available_positions !== undefined && (!Number.isInteger(body.available_positions) || body.available_positions < 1)) errors.push('available_positions must be a positive integer');
  if (body.application_deadline !== undefined) {
    const s = body.application_deadline;
    if (typeof s !== 'string' || !/^\d{4}-\d{2}-\d{2}$/.test(s) || Number.isNaN(Date.parse(s)) || new Date(s).toISOString().slice(0,10) !== s) errors.push('application_deadline must be a valid YYYY-MM-DD date');
  }
  if (body.status !== undefined && !['Open', 'Closed'].includes(body.status)) errors.push('status must be Open or Closed');
  for (const key of Object.keys(body)) if (!fields.includes(key)) errors.push(`${key} is not an allowed field`);
  return [...new Set(errors)];
}
function idFrom(req, res) {
  const id = Number(req.params.id);
  if (!Number.isSafeInteger(id) || id < 1) { res.status(400).json({ message: 'Invalid opportunity ID' }); return null; }
  return id;
}
function asyncRoute(fn) {
  return (req, res, next) => Promise.resolve(fn(req, res)).catch(next);
}
app.get('/api/health', asyncRoute(async (req,res) => {
  await db.query('SELECT 1');
  res.json({message:'API and database are running'});
}));
app.post('/api/opportunities', asyncRoute(async (req,res) => {
  const errors = validate(req.body || {});
  if (errors.length) return res.status(400).json({message:'Validation failed', errors});
  const o = {...req.body, status: req.body.status || 'Open'};
  const [result] = await db.execute(`INSERT INTO opportunities (${fields.join(', ')}) VALUES (${fields.map(() => '?').join(', ')})`, fields.map(f => o[f]));
  const [rows] = await db.execute(`SELECT ${selectFields} FROM opportunities WHERE id = ?`, [result.insertId]);
  res.status(201).json({message:'Opportunity created', opportunity:rows[0]});
}));
app.get('/api/opportunities', asyncRoute(async (req,res) => {
  const [rows] = await db.query(`SELECT ${selectFields} FROM opportunities ORDER BY created_at DESC, id DESC`);
  res.json(rows);
}));
app.get('/api/opportunities/:id', asyncRoute(async (req,res) => {
  const id = idFrom(req,res); if (!id) return;
  const [rows] = await db.execute(`SELECT ${selectFields} FROM opportunities WHERE id = ?`, [id]);
  if (!rows.length) return res.status(404).json({message:'Opportunity not found'});
  res.json(rows[0]);
}));
app.put('/api/opportunities/:id', asyncRoute(async (req,res) => {
  const id = idFrom(req,res); if (!id) return;
  const [existing] = await db.execute(`SELECT ${selectFields} FROM opportunities WHERE id = ?`, [id]);
  if (!existing.length) return res.status(404).json({message:'Opportunity not found'});
  const merged = Object.fromEntries(fields.map(f => [f, req.body[f] === undefined ? existing[0][f] : req.body[f]]));
  // MySQL returns DATE as a Date object, but the form sends YYYY-MM-DD.
  if (merged.application_deadline instanceof Date) {
    merged.application_deadline = merged.application_deadline.toISOString().slice(0, 10);
  }
  const errors = validate({...req.body, ...merged});
  if (errors.length) return res.status(400).json({message:'Validation failed', errors});
  await db.execute(`UPDATE opportunities SET ${fields.map(f => `${f} = ?`).join(', ')} WHERE id = ?`, [...fields.map(f => merged[f]), id]);
  const [rows] = await db.execute(`SELECT ${selectFields} FROM opportunities WHERE id = ?`, [id]);
  res.json({message:'Opportunity updated', opportunity:rows[0]});
}));
app.delete('/api/opportunities/:id', asyncRoute(async (req,res) => {
  const id = idFrom(req,res); if (!id) return;
  const [result] = await db.execute('DELETE FROM opportunities WHERE id = ?', [id]);
  if (!result.affectedRows) return res.status(404).json({message:'Opportunity not found'});
  res.status(200).json({message:'Opportunity deleted'});
}));
app.use((req,res) => res.status(404).json({message:'Route not found'}));
app.use((err,req,res,next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) return res.status(400).json({message:'Invalid JSON body'});
  console.error(err);
  res.status(500).json({message:'Internal server error'});
});
const port = Number(process.env.PORT || 5000);
if (require.main === module) app.listen(port, () => console.log(`API running at http://localhost:${port}`));
module.exports = app;
