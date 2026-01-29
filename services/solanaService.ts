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
import { createCreateMetadataAccountV3Instruction, createCreateMasterEditionV3Instruction } from '@metaplex-foundation/mpl-token-metadata';

const rpcEndpoint =
  (import.meta.env.VITE_HELIUS_RPC_URL as string | undefined)?.trim() ||
  clusterApiUrl('devnet');
const connection = new Connection(rpcEndpoint, 'confirmed');
const METADATA_PROGRAM_ID = new PublicKey('metaqbxxUerdq28cj1RbAWkYQm3ybzjb6a8bt518x1s');

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

export interface MintOptions {
  metadataUri: string;
  name: string;
  symbol?: string;
  treasuryPubkey: string;
  onStatus?: (status: { step: 'wallet' | 'submitted' | 'confirming'; message: string; txHash?: string }) => void;
}

/**
 * Create a real SPL token on devnet (decimals=0, supply=1) — a pseudo-NFT.
 */
export const mintCardToken = async (
  publicKey: PublicKey,
  sendTransaction: (tx: Transaction, connection: Connection, options?: { signers?: Keypair[] }) => Promise<string>,
  options: MintOptions,
  signTransaction?: (tx: Transaction) => Promise<Transaction>,
): Promise<MintResult> => {
  await ensureDevnetBalance(publicKey);

  const mintKeypair = Keypair.generate();
  const treasuryPublicKey = new PublicKey(options.treasuryPubkey);
  const lamports = await getMinimumBalanceForRentExemptMint(connection);

  // Derive the user's Associated Token Account for this mint
  const ata = getAssociatedTokenAddressSync(mintKeypair.publicKey, treasuryPublicKey);

  const [metadataPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
    ],
    METADATA_PROGRAM_ID,
  );
  const [masterEditionPda] = PublicKey.findProgramAddressSync(
    [
      Buffer.from('metadata'),
      METADATA_PROGRAM_ID.toBuffer(),
      mintKeypair.publicKey.toBuffer(),
      Buffer.from('edition'),
    ],
    METADATA_PROGRAM_ID,
  );

  const transaction = new Transaction().add(
    // 1. Create the mint account
    SystemProgram.createAccount({
      fromPubkey: publicKey,
      newAccountPubkey: mintKeypair.publicKey,
      space: MINT_SIZE,
      lamports,
      programId: TOKEN_PROGRAM_ID,
    }),
    // 2. Initialize as a mint (decimals=0, authority=user, freeze authority=user)
    createInitializeMintInstruction(
      mintKeypair.publicKey,
      0,
      publicKey,
      publicKey,
    ),
    // 3. Create Associated Token Account for the treasury (holds inventory)
    createAssociatedTokenAccountInstruction(
      publicKey,
      ata,
      treasuryPublicKey,
      mintKeypair.publicKey,
    ),
    // 4. Mint exactly 1 token
    createMintToInstruction(
      mintKeypair.publicKey,
      ata,
      publicKey,
      1,
    ),
    // 5. Create on-chain metadata
    createCreateMetadataAccountV3Instruction(
      {
        metadata: metadataPda,
        mint: mintKeypair.publicKey,
        mintAuthority: publicKey,
        payer: publicKey,
        updateAuthority: publicKey,
      },
      {
        createMetadataAccountArgsV3: {
          data: {
            name: options.name,
            symbol: options.symbol || 'ETF',
            uri: options.metadataUri,
            sellerFeeBasisPoints: 0,
            creators: null,
            collection: null,
            uses: null,
          },
          isMutable: true,
          collectionDetails: null,
        },
      },
    ),
    // 6. Create master edition (NFT semantics)
    createCreateMasterEditionV3Instruction(
      {
        edition: masterEditionPda,
        mint: mintKeypair.publicKey,
        updateAuthority: publicKey,
        mintAuthority: publicKey,
        payer: publicKey,
        metadata: metadataPda,
      },
      { createMasterEditionArgs: { maxSupply: 0 } },
    ),
    // 7. (Optional) Revoke mint authority to make supply fixed.
    // Removed for now to avoid authority mismatch errors; can be done in a follow-up tx.
  );

  const { blockhash, lastValidBlockHeight } = await connection.getLatestBlockhash();
  const currentBlockHeight = await connection.getBlockHeight('confirmed');
  if (lastValidBlockHeight <= currentBlockHeight) {
    throw new Error(
      `Stale blockhash from RPC ${connection.rpcEndpoint}. lastValidBlockHeight=${lastValidBlockHeight} currentBlockHeight=${currentBlockHeight}`,
    );
  }
  transaction.recentBlockhash = blockhash;
  transaction.feePayer = publicKey;

  // The mintKeypair must sign to prove ownership of the new account
  transaction.partialSign(mintKeypair);

  options.onStatus?.({ step: 'wallet', message: 'Waiting for wallet approval...' });
  let txHash: string;
  try {
    if (signTransaction) {
      const signed = await signTransaction(transaction);
      txHash = await connection.sendRawTransaction(signed.serialize(), {
        skipPreflight: false,
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
    } else {
      txHash = await sendTransaction(transaction, connection, {
        preflightCommitment: 'confirmed',
        maxRetries: 3,
      });
    }
  } catch (error) {
    console.error('sendTransaction failed:', error);
    if (error instanceof Error) {
      console.error('sendTransaction error props:', Object.getOwnPropertyNames(error));
      console.error({
        name: error.name,
        message: error.message,
        stack: error.stack,
      });
    } else {
      console.error('sendTransaction threw non-Error:', error);
    }
    const errorAny = error as unknown as Record<string, unknown>;
    console.error('sendTransaction error cause:', errorAny?.cause);
    console.error('sendTransaction error data:', errorAny?.data);
    console.error('sendTransaction error logs:', errorAny?.logs);
    console.error('sendTransaction error error:', errorAny?.error);
    throw error;
  }
  options.onStatus?.({ step: 'submitted', message: 'Transaction submitted. Awaiting confirmation...', txHash });

  options.onStatus?.({ step: 'confirming', message: 'Confirming on Solana devnet...', txHash });
  await withTimeout(
    connection.confirmTransaction(
      { signature: txHash, blockhash, lastValidBlockHeight },
      'confirmed',
    ),
    120000,
    'Transaction confirmation',
  );

  return { txHash, mintAddress: mintKeypair.publicKey.toBase58() };
};
