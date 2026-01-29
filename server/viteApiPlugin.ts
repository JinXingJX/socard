import type { Plugin } from 'vite';
import { PinataSDK } from 'pinata';
import { saveCard, getCard } from './cardStore';
import { handleActionGet, handleActionPost } from './actionsHandler';
import type { CardData } from '../types';

function setCors(res: import('http').ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'X-Action-Version, X-Blockchain-Ids');
  res.setHeader('X-Action-Version', '2.0');
  res.setHeader('X-Blockchain-Ids', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
}

function readBody(req: import('http').IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

function getPinataClient() {
  const jwt = process.env.PINATA_JWT;
  if (!jwt) {
    throw new Error('Missing PINATA_JWT');
  }
  const gateway = process.env.PINATA_GATEWAY;
  return new PinataSDK({
    pinataJwt: jwt,
    pinataGateway: gateway,
  });
}

function toBase64(dataUrl: string): { base64: string; mime: string } {
  const match = dataUrl.match(/^data:([^;]+);base64,(.+)$/);
  if (!match) {
    throw new Error('Invalid image data URL.');
  }
  return { mime: match[1], base64: match[2] };
}

export default function apiPlugin(): Plugin {
  return {
    name: 'solana-actions-api',
    configureServer(server) {
      server.middlewares.use(async (req, res, next) => {
        const url = new URL(req.url!, `http://${req.headers.host}`);
        const pathname = url.pathname;

        // --- CORS preflight for all /api/* and /actions.json ---
        if (req.method === 'OPTIONS' && (pathname.startsWith('/api/') || pathname === '/actions.json')) {
          setCors(res);
          res.writeHead(204);
          res.end();
          return;
        }

        // --- GET /actions.json — Solana Actions discovery ---
        if (pathname === '/actions.json' && req.method === 'GET') {
          setCors(res);
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({
            rules: [
              { pathPattern: '/api/actions/buy**', apiPath: '/api/actions/buy**' },
            ],
          }));
          return;
        }

        // --- POST /api/cards — save a card ---
        if (pathname === '/api/cards' && req.method === 'POST') {
          try {
            const body = JSON.parse(await readBody(req)) as CardData;
            saveCard(body);
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ ok: true, id: body.id }));
          } catch (e) {
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Invalid JSON' }));
          }
          return;
        }

        // --- POST /api/pin — upload image + metadata to Pinata/IPFS ---
        if (pathname === '/api/pin' && req.method === 'POST') {
          try {
            const body = JSON.parse(await readBody(req)) as {
              name: string;
              description: string;
              rarity: string;
              stats: { attack: number; defense: number };
              imageUrl: string;
            };
            const pinata = getPinataClient();
            const { base64 } = toBase64(body.imageUrl);

            const imageUpload = await pinata.upload.public.base64(base64);

            const imageCid = imageUpload.cid;
            const metadata = {
              name: body.name,
              symbol: 'ETF',
              description: body.description,
              image: `ipfs://${imageCid}`,
              attributes: [
                { trait_type: 'Rarity', value: body.rarity },
                { trait_type: 'Attack', value: body.stats?.attack ?? 0 },
                { trait_type: 'Defense', value: body.stats?.defense ?? 0 },
              ],
              properties: {
                files: [{ uri: `ipfs://${imageCid}`, type: 'image/png' }],
                category: 'image',
              },
            };

            const metadataUpload = await pinata.upload.public.json(metadata);

            const metadataCid = metadataUpload.cid;
            res.writeHead(200, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({
              imageCid,
              metadataCid,
              metadataUri: `ipfs://${metadataCid}`,
              imageUri: `ipfs://${imageCid}`,
            }));
          } catch (e) {
            res.writeHead(500, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: (e as Error).message || 'Pinata upload failed' }));
          }
          return;
        }

        // --- GET /api/cards/:id/image — serve card image as PNG ---
        const imageMatch = pathname.match(/^\/api\/cards\/([^/]+)\/image$/);
        if (imageMatch && req.method === 'GET') {
          const card = getCard(imageMatch[1]);
          if (!card || !card.imageUrl) {
            res.writeHead(404);
            res.end('Not found');
            return;
          }
          // imageUrl is a data:image/png;base64,... string
          const base64 = card.imageUrl.replace(/^data:image\/\w+;base64,/, '');
          const buf = Buffer.from(base64, 'base64');
          res.writeHead(200, {
            'Content-Type': 'image/png',
            'Content-Length': buf.length,
            'Cache-Control': 'public, max-age=3600',
          });
          res.end(buf);
          return;
        }

        // --- GET/POST /api/actions/buy ---
        if (pathname === '/api/actions/buy') {
          const cardId = url.searchParams.get('cardId');
          if (!cardId) {
            setCors(res);
            res.writeHead(400, { 'Content-Type': 'application/json' });
            res.end(JSON.stringify({ error: 'Missing cardId' }));
            return;
          }

          if (req.method === 'GET') {
            await handleActionGet(req, res, cardId);
            return;
          }
          if (req.method === 'POST') {
            const amount = parseFloat(url.searchParams.get('amount') || '0.1');
            await handleActionPost(req, res, cardId, amount);
            return;
          }
        }

        next();
      });
    },
  };
}
