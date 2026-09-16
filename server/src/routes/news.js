import express from 'express';
import { newsFeed } from '../services/newsFeed.js';

const router = express.Router();

// GET /api/news — public. Results are cached server-side for one hour, so many
// homepage visits consume only one provider request. The provider key remains
// in server/.env and is never returned to the browser.
router.get('/', async (req, res) => {
  try {
    const result = await newsFeed.getArticles();
    res.set('Cache-Control', 'public, max-age=300');
    return res.json({ ...result, provider: 'Currents' });
  } catch (error) {
    console.error('[news] feed failed:', error.message);
    return res.status(503).json({ error: 'News is temporarily unavailable.' });
  }
});

export default router;
