import { API_BASE } from '../config.js';

async function postJson(url, body) {
  const response = await fetch(API_BASE + url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}

async function getJson(url) {
  const response = await fetch(API_BASE + url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }
  return await response.json();
}

export async function parseScript(text) {
  return await postJson('/api/parse', { text });
}

export async function compileSession(req) {
  return await postJson('/api/compile', req);
}

export async function getPresets() {
  return await getJson('/api/presets');
}
