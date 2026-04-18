import path from 'path';
import { fileURLToPath } from 'url';
import dotenv from 'dotenv';
import OpenAI from 'openai';

// Single source of truth: server/.env. Resolved relative to this file so it
// works regardless of the CWD the ai-service is invoked from.
const __dirname = path.dirname(fileURLToPath(import.meta.url));
dotenv.config({ path: path.resolve(__dirname, '../../../server/.env') });

let _client = null;

export function getGroqClient() {
  if (!_client) {
    if (!process.env.DIGITALOCEAN_API_KEY) {
      throw new Error(
        'DIGITALOCEAN_API_KEY is not set. Add it to your .env file.'
      );
    }
    _client = new OpenAI({
      apiKey: process.env.DIGITALOCEAN_API_KEY,
      baseURL: 'https://inference.do-ai.run/v1',
    });
  }
  return _client;
}

export function getModel() {
  return process.env.AI_MODEL || 'openai/gpt-4o-mini';
}
