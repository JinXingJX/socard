import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

/**
 * Check balance and request airdrop if below threshold.
 */
export const ensureDevnetBalance = async (publicKey: PublicKey): Promise<void> => {
  const balance = await connection.getBalance(publicKey);
  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
    await connection.confirmTransaction(sig, 'confirmed');
  }
};

/**
 * Create a minimal self-transfer on devnet and return the tx signature.
 */
export const mintCardToken = async (
  publicKey: PublicKey,
  signTransaction: (tx: Transaction) => Promise<Transaction>,
): Promise<string> => {
  await ensureDevnetBalance(publicKey);

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: publicKey,
      toPubkey: publicKey,
      lamports: 1, // minimal self-transfer
    }),
  );

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  const signed = await signTransaction(transaction);
  const rawTransaction = signed.serialize();
  const txHash = await connection.sendRawTransaction(rawTransaction);

  await connection.confirmTransaction(
    { signature: txHash, blockhash, lastValidBlockHeight },
    'confirmed',
  );

  return txHash;
};
