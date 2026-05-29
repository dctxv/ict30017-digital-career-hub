import express from 'express';

const router = express.Router();

router.all('*', (req, res) => {
  res.status(501).json({ error: 'Career paths route not yet implemented.' });
});

export default router;
