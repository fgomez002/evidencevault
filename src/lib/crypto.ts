import 'react-native-get-random-values';
import * as FileSystem from 'expo-file-system';
import * as SecureStore from 'expo-secure-store';
import * as Crypto from 'expo-crypto';
import nacl from 'tweetnacl';
import { bytesToBase64, base64ToBytes } from './base64';

/**
 * EvidenceVault client-side encryption (Hybrid model).
 *
 * Evidence FILE bytes are encrypted on-device with XSalsa20-Poly1305
 * (NaCl secretbox) before they ever leave the phone. Supabase Storage only
 * ever sees ciphertext. Incident TEXT remains in Postgres under RLS so search
 * and reporting stay fast — see PLAN.md §4.
 *
 * Key management:
 *  - A single 32-byte "vault key" is generated on first run and stored in the
 *    device Keychain/Keystore via expo-secure-store (hardware-backed where
 *    available, gated behind the biometric app lock).
 *  - Each file is encrypted with a fresh random 24-byte nonce. The nonce is
 *    NOT secret and is stored alongside the ciphertext metadata.
 */

const VAULT_KEY_STORE = 'ev_vault_key_v1';

const toBase64 = bytesToBase64;
const fromBase64 = base64ToBytes;

// ---- vault key lifecycle ----
export async function getOrCreateVaultKey(): Promise<Uint8Array> {
  const existing = await SecureStore.getItemAsync(VAULT_KEY_STORE, {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  if (existing) return fromBase64(existing);

  const key = nacl.randomBytes(nacl.secretbox.keyLength); // 32 bytes
  await SecureStore.setItemAsync(VAULT_KEY_STORE, toBase64(key), {
    keychainAccessible: SecureStore.WHEN_UNLOCKED_THIS_DEVICE_ONLY,
  });
  return key;
}

export async function hasVaultKey(): Promise<boolean> {
  return (await SecureStore.getItemAsync(VAULT_KEY_STORE)) != null;
}

export interface EncryptedFileMeta {
  nonce: string; // base64
  algo: 'xsalsa20-poly1305';
  size: number; // plaintext size in bytes
}

/**
 * Encrypt a local file and write the ciphertext to `outUri`. Returns metadata
 * needed to decrypt later. Suitable for the small/medium evidence the MVP
 * handles; very large videos should be chunked in a later pass.
 */
export async function encryptFileToUri(
  inUri: string,
  outUri: string,
): Promise<EncryptedFileMeta> {
  const key = await getOrCreateVaultKey();
  const b64 = await FileSystem.readAsStringAsync(inUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const plain = fromBase64(b64);
  const nonce = nacl.randomBytes(nacl.secretbox.nonceLength); // 24 bytes
  const cipher = nacl.secretbox(plain, nonce, key);
  await FileSystem.writeAsStringAsync(outUri, toBase64(cipher), {
    encoding: FileSystem.EncodingType.Base64,
  });
  return { nonce: toBase64(nonce), algo: 'xsalsa20-poly1305', size: plain.length };
}

/**
 * Decrypt a ciphertext file back to a usable local file at `outUri`.
 * Throws if the authentication tag fails (tampering / wrong key).
 */
export async function decryptFileToUri(
  inUri: string,
  outUri: string,
  meta: EncryptedFileMeta,
): Promise<void> {
  const key = await getOrCreateVaultKey();
  const b64 = await FileSystem.readAsStringAsync(inUri, {
    encoding: FileSystem.EncodingType.Base64,
  });
  const cipher = fromBase64(b64);
  const nonce = fromBase64(meta.nonce);
  const plain = nacl.secretbox.open(cipher, nonce, key);
  if (!plain) throw new Error('Decryption failed: data may be corrupted or tampered with.');
  await FileSystem.writeAsStringAsync(outUri, toBase64(plain), {
    encoding: FileSystem.EncodingType.Base64,
  });
}

/** Generate a short random id for storage paths. */
export function randomId(): string {
  return Crypto.randomUUID();
}
