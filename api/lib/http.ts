// Lecture publique : l'app (et sa version web) peut appeler l'API depuis n'importe quelle origine.
const CORS = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type, Authorization',
};

export function json(data: unknown, init: { status?: number; cache?: string } = {}) {
  return Response.json(data, {
    status: init.status ?? 200,
    headers: { ...CORS, 'Cache-Control': init.cache ?? 'no-store' },
  });
}

export function options() {
  return new Response(null, { status: 204, headers: CORS });
}
