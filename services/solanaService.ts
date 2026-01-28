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
 * Airdrop failures are non-fatal — user can manually fund via faucet.
 */
export const ensureDevnetBalance = async (publicKey: PublicKey): Promise<void> => {
  const balance = await connection.getBalance(publicKey);
  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    try {
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      // Wait for airdrop with a timeout — devnet airdrops are often rate-limited
      const abortController = new AbortController();
      const timeout = setTimeout(() => abortController.abort(), 15000);
      try {
        await connection.confirmTransaction(
          { signature: sig, ...(await connection.getLatestBlockhash()) },
          'confirmed',
        );
      } finally {
        clearTimeout(timeout);
      }
    } catch (e) {
      console.warn('Airdrop failed (rate-limited or devnet issue). Proceeding anyway.', e);
      // Re-check: if still no balance, throw a clear error
      const postBalance = await connection.getBalance(publicKey);
      if (postBalance < 5000) {
        throw new Error(
          'Wallet has insufficient SOL and airdrop failed. Please fund your devnet wallet manually at https://faucet.solana.com',
        );
      }
    }
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
  const txHash = await connection.sendRawTransaction(rawTransaction, {
    skipPreflight: false,
    maxRetries: 3,
  });

  await connection.confirmTransaction(
    { signature: txHash, blockhash, lastValidBlockHeight },
    'confirmed',
  );

  return txHash;
};
