import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const dataPath = path.join(__dirname, '../data/disciplines.json');

function readDisciplines() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeDisciplines(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  try {
    const disciplines = readDisciplines();
    res.json(disciplines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const disciplines = readDisciplines();
    const newId = disciplines.length > 0 ? Math.max(...disciplines.map(d => d.id)) + 1 : 1;
    const newDiscipline = { id: newId, name: req.body.name, description: req.body.description || '' };
    disciplines.push(newDiscipline);
    writeDisciplines(disciplines);
    res.json(newDiscipline);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const disciplines = readDisciplines();
    const id = parseInt(req.params.id);
    const index = disciplines.findIndex(d => d.id === id);
    if (index === -1) return res.status(404).json({ error: 'Discipline not found' });
    disciplines[index] = { ...disciplines[index], name: req.body.name, description: req.body.description || '' };
    writeDisciplines(disciplines);
    res.json(disciplines[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const disciplines = readDisciplines();
    const id = parseInt(req.params.id);
    const filtered = disciplines.filter(d => d.id !== id);
    if (filtered.length === disciplines.length) return res.status(404).json({ error: 'Discipline not found' });
    writeDisciplines(filtered);
    res.json({ message: 'Discipline deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;