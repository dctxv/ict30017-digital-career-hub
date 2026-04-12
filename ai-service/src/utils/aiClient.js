import 'dotenv/config';
import Groq from 'groq-sdk';

let _groqClient = null;

export function getGroqClient() {
  if (!_groqClient) {
    if (!process.env.GROQ_API_KEY) {
      throw new Error(
        'GROQ_API_KEY is not set. Copy .env.example to .env and add your key.'
      );
    }
    _groqClient = new Groq({ apiKey: process.env.GROQ_API_KEY });
  }
  return _groqClient;
}

export function getModel() {
  return process.env.GROQ_MODEL || 'llama-3.3-70b-versatile';
}
