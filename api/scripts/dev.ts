/**
 * Serveur local qui imite les fonctions Vercel (api/*.ts → /api/*), sans compte Vercel.
 * Usage : DATABASE_URL=… npm run dev
 */
import { createServer } from 'node:http';

const PORT = Number(process.env.PORT) || 3001;

type Handler = (request: Request) => Promise<Response> | Response;
type Module = Partial<Record<'GET' | 'POST' | 'OPTIONS', Handler>>;

createServer(async (req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`);
  try {
    const mod: Module = await import(`../api${url.pathname.replace(/^\/api/, '')}.ts`);
    const handler = mod[req.method as keyof Module];
    if (!handler) {
      res.writeHead(405).end();
      return;
    }
    const chunks: Buffer[] = [];
    for await (const chunk of req) chunks.push(chunk as Buffer);
    const request = new Request(url, {
      method: req.method,
      headers: req.headers as Record<string, string>,
      body: chunks.length ? Buffer.concat(chunks) : undefined,
    });
    const response = await handler(request);
    res.writeHead(response.status, Object.fromEntries(response.headers));
    res.end(Buffer.from(await response.arrayBuffer()));
  } catch (e) {
    const introuvable = (e as { code?: string }).code === 'ERR_MODULE_NOT_FOUND';
    res.writeHead(introuvable ? 404 : 500, { 'Content-Type': 'text/plain' });
    res.end(introuvable ? 'Not found' : String(e));
  }
}).listen(PORT, () => console.log(`API locale : http://localhost:${PORT}/api/publications`));
