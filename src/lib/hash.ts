import * as Crypto from 'expo-crypto';
import * as FileSystem from 'expo-file-system';

/**
 * Compute the SHA-256 hash of a local file, reading it in chunks so we never
 * hold the whole file in memory. Returns a lowercase hex digest.
 *
 * This digest is captured the moment evidence enters the vault and is the
 * anchor of the chain-of-custody: if the file's bytes ever change, the hash
 * won't match and the SecureBadge flips to "Unverified".
 */
const CHUNK_SIZE = 512 * 1024; // 512 KB

export async function sha256OfFile(uri: string): Promise<string> {
  const info = await FileSystem.getInfoAsync(uri, { size: true });
  if (!info.exists) throw new Error('File does not exist: ' + uri);
  const size = info.size ?? 0;

  // expo-crypto has no streaming digest, so we hash each base64 chunk and then
  // hash the concatenation of chunk-digests. This is deterministic and avoids
  // loading large videos fully into JS memory.
  if (size <= CHUNK_SIZE) {
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });
    return digestBase64(b64);
  }

  const chunkDigests: string[] = [];
  let position = 0;
  while (position < size) {
    const length = Math.min(CHUNK_SIZE, size - position);
    const b64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
      position,
      length,
    });
    chunkDigests.push(await digestBase64(b64));
    position += length;
  }
  return Crypto.digestStringAsync(
    Crypto.CryptoDigestAlgorithm.SHA256,
    chunkDigests.join(''),
  );
}

async function digestBase64(b64: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, b64);
}

export async function sha256OfString(value: string): Promise<string> {
  return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, value);
}
