import {
  Connection,
  PublicKey,
  Transaction,
  SystemProgram,
  Keypair,
  clusterApiUrl,
  LAMPORTS_PER_SOL,
} from '@solana/web3.js';
import {
  TOKEN_PROGRAM_ID,
  MINT_SIZE,
  getMinimumBalanceForRentExemptMint,
  createInitializeMintInstruction,
  getAssociatedTokenAddressSync,
  createAssociatedTokenAccountInstruction,
  createMintToInstruction,
} from '@solana/spl-token';

const connection = new Connection(clusterApiUrl('devnet'), 'confirmed');

const withTimeout = <T>(promise: Promise<T>, ms: number, label: string): Promise<T> => {
  return Promise.race([
    promise,
    new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error(`${label} timed out after ${ms / 1000}s`)), ms),
    ),
  ]);
};

/**
 * Check balance and request airdrop if below threshold.
 * Airdrop failures are non-fatal — user can manually fund via faucet.
 */
export const ensureDevnetBalance = async (publicKey: PublicKey): Promise<void> => {
  const balance = await connection.getBalance(publicKey);
  if (balance < 0.01 * LAMPORTS_PER_SOL) {
    try {
      const sig = await connection.requestAirdrop(publicKey, LAMPORTS_PER_SOL);
      await withTimeout(
        connection.confirmTransaction(
          { signature: sig, ...(await connection.getLatestBlockhash()) },
          'confirmed',
        ),
        15000,
        'Airdrop confirmation',
      );
    } catch (e) {
      console.warn('Airdrop failed (rate-limited or devnet issue). Proceeding anyway.', e);
      const postBalance = await connection.getBalance(publicKey);
      if (postBalance < 5000) {
        throw new Error(
          'Wallet has insufficient SOL and airdrop failed. Please fund your devnet wallet manually at https://faucet.solana.com',
        );
      }
    }
  }
};

export interface MintResult {
  txHash: string;
  mintAddress: string;
}

/**
 * Create a real SPL token on devnet (decimals=0, supply=1) — a pseudo-NFT.
 */
export const mintCardToken = async (
  publicKey: PublicKey,
  sendTransaction: (tx: Transaction, connection: Connection, options?: { signers?: Keypair[] }) => Promise<string>,
): Promise<MintResult> => {
  await ensureDevnetBalance(publicKey);

  const mintKeypair = Keypair.generate();
  const lamports = await getMinimumBalanceForRentExemptMint(connection);
  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();

  // Derive the user's Associated Token Account for this mint
  const ata = getAssociatedTokenAddressSync(mintKeypair.publicKey, publicKey);

  const transaction = new Transaction().add(
    // 1. Create the mint account
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    // 2. Initialize as a mint (decimals=0, authority=user, no freeze authority)
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      0,
      publicKey,
      null,
    ),
    // 3. Create Associated Token Account for the user
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      publicKey,
      mintKeypair.publicKey,
    ),
    // 4. Mint exactly 1 token
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      publicKey,
      1,
    ),
  );

  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  // The mintKeypair must sign to prove ownership of the new account
  transaction.partialSign(mintKeypair);

  const txHash = await sendTransaction(transaction, connection);

  await withTimeout(
    connection.confirmTransaction(
      { signature: txHash, blockhash, lastValidBlockHeight },
      'confirmed',
    ),
    30000,
    'Transaction confirmation',
  );

  return { txHash, mintAddress: mintKeypair.publicKey.toBase58() };
};
