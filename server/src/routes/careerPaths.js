import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const dataPath = path.join(__dirname, '../data/career_paths.json');

function readCareerPaths() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeCareerPaths(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  try {
    const paths = readCareerPaths();
    res.json(paths);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.get('/:id', (req, res) => {
  try {
    const paths = readCareerPaths();
    const id = parseInt(req.params.id);
    const path = paths.find(p => p.id === id);
    if (!path) return res.status(404).json({ error: 'Career path not found' });
    res.json(path);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const paths = readCareerPaths();
    const newId = paths.length > 0 ? Math.max(...paths.map(p => p.id)) + 1 : 1;
    const newPath = { id: newId, ...req.body };
    paths.push(newPath);
    writeCareerPaths(paths);
    res.json(newPath);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.put('/:id', (req, res) => {
  try {
    const paths = readCareerPaths();
    const id = parseInt(req.params.id);
    const index = paths.findIndex(p => p.id === id);
    if (index === -1) return res.status(404).json({ error: 'Career path not found' });
    paths[index] = { ...paths[index], ...req.body, id };
    writeCareerPaths(paths);
    res.json(paths[index]);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:id', (req, res) => {
  try {
    const paths = readCareerPaths();
    const id = parseInt(req.params.id);
    const filtered = paths.filter(p => p.id !== id);
    if (filtered.length === paths.length) return res.status(404).json({ error: 'Career path not found' });
    writeCareerPaths(filtered);
    res.json({ message: 'Career path deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;