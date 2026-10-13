// Supabase Edge Function "gfd": every game action goes through here.
import postgres from 'npm:postgres@3.4.5';
import { createEngine } from './engine.js';
import { handle } from './server_core.js';

const sql = postgres(Deno.env.get('SUPABASE_DB_URL')!, { prepare: false, max: 3, idle_timeout: 20 });
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, apikey, content-type, x-client-info',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: CORS });
  let out: unknown, status = 200;
  try {
    const body = await req.json();
    out = await handle(body, sql, createEngine);
  } catch (e) {
    console.error('gfd error', e);
    out = { ok: false, reason: 'server_error' };
    status = 500;
  }
  return new Response(JSON.stringify(out), { status, headers: { ...CORS, 'Content-Type': 'application/json' } });
});
