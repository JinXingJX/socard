import type { IncomingMessage, ServerResponse } from 'http';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import { getCard } from './cardStore';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

// Treasury address — receives SOL from Blink purchases.
// Replace with your own devnet wallet for testing.
const TREASURY = new PublicKey('11111111111111111111111111111112');

const PRICE_OPTIONS = [
  { label: 'Buy 0.1 SOL', amount: 0.1 },
  { label: 'Buy 0.5 SOL', amount: 0.5 },
  { label: 'Buy 1 SOL', amount: 1 },
];

function setCorsHeaders(res: ServerResponse) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Accept');
  res.setHeader('Access-Control-Expose-Headers', 'X-Action-Version, X-Blockchain-Ids');
  res.setHeader('X-Action-Version', '2.0');
  res.setHeader('X-Blockchain-Ids', 'solana:EtWTRABZaYq6iMfeYKouRu166VU2xqa1');
}

function json(res: ServerResponse, status: number, body: unknown) {
  res.writeHead(status, { 'Content-Type': 'application/json' });
  res.end(JSON.stringify(body));
}

function readBody(req: IncomingMessage): Promise<string> {
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    req.on('data', (c: Buffer) => chunks.push(c));
    req.on('end', () => resolve(Buffer.concat(chunks).toString()));
    req.on('error', reject);
  });
}

export async function handleActionGet(
  req: IncomingMessage,
  res: ServerResponse,
  cardId: string,
): Promise<void> {
  setCorsHeaders(res);

  const card = getCard(cardId);
  if (!card) {
    json(res, 404, { error: 'Card not found' });
    return;
  }

  const origin = `${req.headers['x-forwarded-proto'] || 'http'}://${req.headers.host}`;
  const icon = `${origin}/api/cards/${cardId}/image`;

  const payload = {
    type: 'action',
    icon,
    title: `${card.name} — Solana ETF Card`,
    description: card.description,
    label: 'Buy',
    links: {
      actions: PRICE_OPTIONS.map((opt) => ({
        label: opt.label,
        href: `${origin}/api/actions/buy?cardId=${cardId}&amount=${opt.amount}`,
        type: 'transaction',
      })),
    },
  };

  json(res, 200, payload);
}

export async function handleActionPost(
  req: IncomingMessage,
  res: ServerResponse,
  cardId: string,
  amount: number,
): Promise<void> {
  setCorsHeaders(res);

  const card = getCard(cardId);
  if (!card) {
    json(res, 404, { error: 'Card not found' });
    return;
  }

  const body = JSON.parse(await readBody(req));
  const account = new PublicKey(body.account);

  const lamports = Math.round(amount * LAMPORTS_PER_SOL);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const tx = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: TREASURY,
      lamports,
    }),
  );
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = account;

  const serialized = tx.serialize({ requireAllSignatures: false }).toString('base64');

  json(res, 200, { transaction: serialized, message: `Buying ${card.name} for ${amount} SOL` });
}
