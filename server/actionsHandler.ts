import type { IncomingMessage, ServerResponse } from 'http';
import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
  Keypair,
} from '@solana/web3.js';
import {
  createAssociatedTokenAccountInstruction,
  createTransferInstruction,
  getAssociatedTokenAddressSync,
} from '@solana/spl-token';
import { getCard } from './cardStore';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

function loadTreasuryKeypair(): Keypair {
  const secret = process.env.TREASURY_SECRET_KEY;
  if (!secret) {
    throw new Error('Missing TREASURY_SECRET_KEY');
  }
  let secretKey: number[];
  try {
    secretKey = JSON.parse(secret);
  } catch {
    throw new Error('TREASURY_SECRET_KEY must be a JSON array.');
  }
  return Keypair.fromSecretKey(Uint8Array.from(secretKey));
}

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

  const priceSol = Number.isFinite(card.priceSol) ? card.priceSol : 0.1;
  const payload = {
    type: 'action',
    icon,
    title: `${card.name} — Solana ETF Card`,
    description: card.description,
    label: `Buy ${priceSol} SOL`,
    links: {
      actions: [
        {
          label: `Buy ${priceSol} SOL`,
          href: `${origin}/api/actions/buy?cardId=${cardId}&amount=${priceSol}`,
          type: 'transaction',
        },
      ],
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

  const priceSol = Number.isFinite(card.priceSol) ? card.priceSol : amount;
  const lamports = Math.round(priceSol * LAMPORTS_PER_SOL);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  if (!card.mintAddress) {
    json(res, 400, { error: 'Card has no mintAddress' });
    return;
  }

  let treasury: Keypair;
  try {
    treasury = loadTreasuryKeypair();
  } catch (e) {
    json(res, 500, { error: (e as Error).message || 'Treasury misconfigured' });
    return;
  }

  const mint = new PublicKey(card.mintAddress);
  const treasuryAta = getAssociatedTokenAddressSync(mint, treasury.publicKey);
  const buyerAta = getAssociatedTokenAddressSync(mint, account);

  const buyerAtaInfo = await connection.getAccountInfo(buyerAta);
  const treasuryAtaInfo = await connection.getAccountInfo(treasuryAta);
  if (!treasuryAtaInfo) {
    json(res, 400, { error: 'Treasury token account not found for this mint' });
    return;
  }

  const tx = new Transaction();
  if (!buyerAtaInfo) {
    tx.add(
      createAssociatedTokenAccountInstruction(
        account,
        buyerAta,
        account,
        mint,
      ),
    );
  }
  tx.add(
    SystemProgram.transfer({
      fromPubkey: account,
      toPubkey: treasury.publicKey,
      lamports,
    }),
    createTransferInstruction(
      treasuryAta,
      buyerAta,
      treasury.publicKey,
      1,
    ),
  );
  tx.recentBlockhash = blockhash;
  tx.lastValidBlockHeight = lastValidBlockHeight;
  tx.feePayer = account;

  tx.partialSign(treasury);
  const serialized = tx.serialize({ requireAllSignatures: false }).toString('base64');

  json(res, 200, { transaction: serialized, message: `Buying ${card.name} for ${priceSol} SOL` });
}
