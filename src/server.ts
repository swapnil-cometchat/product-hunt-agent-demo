import http from 'http';
import { URL } from 'url';
import { searchProducts, getTopProductsByVotes } from './services/producthunt.js';
import { productHuntAgent } from './mastra/agents/producthunt-agent.js';

const PORT = process.env.PORT ? Number(process.env.PORT) : 8787;

function json(res: http.ServerResponse, status: number, data: any) {
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type',
  });
  res.end(JSON.stringify(data));
}

const server = http.createServer(async (req, res) => {
  try {
    // Handle CORS preflight
    if (req.method === 'OPTIONS') {
      res.writeHead(204, {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type',
      });
      res.end();
      return;
    }

    const url = new URL(req.url || '/', `http://${req.headers.host}`);
    const { pathname, searchParams } = url;

    if (req.method === 'GET' && pathname === '/api/health') {
      json(res, 200, { ok: true });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/top') {
      const firstRaw = searchParams.get('limit') || searchParams.get('first') || '3';
      const first = Math.max(1, Math.min(10, Number(firstRaw) || 3));
      const posts = await getTopProductsByVotes(first);
      json(res, 200, { posts, first, order: 'VOTES' });
      return;
    }

    if (req.method === 'GET' && pathname === '/api/search') {
      const q = (searchParams.get('q') || '').trim();
      if (!q) {
        json(res, 400, { error: 'Missing q' });
        return;
      }
      const hits = await searchProducts(q);
      json(res, 200, { hits, q });
      return;
    }

    if (req.method === 'POST' && pathname === '/api/chat') {
      let body = '';
      req.on('data', (chunk) => (body += chunk));
      req.on('end', async () => {
        try {
          const data = body ? JSON.parse(body) : {};
          const message: string = (data.message || '').toString();
          if (!message) {
            json(res, 400, { error: 'Missing message' });
            return;
          }

          // Use agent streaming and accumulate text
          const response = await productHuntAgent.stream([
            { role: 'user', content: message },
          ]);
          let full = '';
          for await (const chunk of response.textStream) {
            full += chunk;
          }
          json(res, 200, { reply: full });
        } catch (e: any) {
          json(res, 500, { error: 'Chat failed', detail: e?.message || String(e) });
        }
      });
      return;
    }

    json(res, 404, { error: 'Not found' });
  } catch (e: any) {
    json(res, 500, { error: 'Server error', detail: e?.message || String(e) });
  }
});

server.listen(PORT, () => {
  // eslint-disable-next-line no-console
  console.log(`Server running on http://localhost:${PORT}`);
});

export default server;
