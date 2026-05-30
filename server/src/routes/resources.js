import express from 'express';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const router = express.Router();

const dataPath = path.join(__dirname, '../data/resources.json');

function readResources() {
  const data = fs.readFileSync(dataPath, 'utf8');
  return JSON.parse(data);
}

function writeResources(data) {
  fs.writeFileSync(dataPath, JSON.stringify(data, null, 2));
}

router.get('/', (req, res) => {
  try {
    const resources = readResources();
    res.json(resources);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.post('/', (req, res) => {
  try {
    const resources = readResources();
    const newResource = { ...req.body };
    resources.push(newResource);
    writeResources(resources);
    res.json(newResource);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

router.delete('/:index', (req, res) => {
  try {
    const resources = readResources();
    const index = parseInt(req.params.index);
    if (index < 0 || index >= resources.length) return res.status(404).json({ error: 'Resource not found' });
    resources.splice(index, 1);
    writeResources(resources);
    res.json({ message: 'Resource deleted' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;