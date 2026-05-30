import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const dataPath = path.join(__dirname, '../data/alumni.json');

function readAlumni() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeAlumni(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  try {
    const alumni = readAlumni();
    const published = alumni.filter(a => a.is_published === true);
    res.json(published);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/discipline/:discipline', (req, res) => {
  try {
    const alumni = readAlumni();
    const discipline = req.params.discipline;
    const filtered = alumni.filter(a => a.is_published === true && a.discipline === discipline);
    res.json(filtered);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const alumni = readAlumni();
    const id = parseInt(req.params.id);
    const alum = alumni.find(a => a.id === id);
    if (!alum) return res.status(404).json({ error: 'Alumni not found' });
    res.json(alum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const alumni = readAlumni();
    const newId = alumni.length > 0 ? Math.max(...alumni.map(a => a.id)) + 1 : 1;
    const newAlum = { id: newId, ...req.body };
    alumni.push(newAlum);
    writeAlumni(alumni);
    res.json(newAlum);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const alumni = readAlumni();
    const id = parseInt(req.params.id);
    const index = alumni.findIndex(a => a.id === id);
    if (index === -1) return res.status(404).json({ error: 'Alumni not found' });
    alumni[index] = { ...alumni[index], ...req.body, id };
    writeAlumni(alumni);
    res.json(alumni[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const alumni = readAlumni();
    const id = parseInt(req.params.id);
    const filtered = alumni.filter(a => a.id !== id);
    if (filtered.length === alumni.length) return res.status(404).json({ error: 'Alumni not found' });
    writeAlumni(filtered);
    res.json({ message: 'Alumni deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;