/**
 * Pure-JS base64 <-> bytes. React Native's Hermes engine ships no `btoa`,
 * `atob`, or Node `Buffer`, so we implement these directly. Binary-safe.
 */
const CHARS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
const LOOKUP = (() => {
  const t = new Uint8Array(256);
  for (let i = 0; i < CHARS.length; i++) t[CHARS.charCodeAt(i)] = i;
  return t;
})();

export function bytesToBase64(bytes: Uint8Array): string {
  let result = '';
  const len = bytes.length;
  for (let i = 0; i < len; i += 3) {
    const b0 = bytes[i];
    const b1 = i + 1 < len ? bytes[i + 1] : 0;
    const b2 = i + 2 < len ? bytes[i + 2] : 0;
    result += CHARS[b0 >> 2];
    result += CHARS[((b0 & 3) << 4) | (b1 >> 4)];
    result += i + 1 < len ? CHARS[((b1 & 15) << 2) | (b2 >> 6)] : '=';
    result += i + 2 < len ? CHARS[b2 & 63] : '=';
  }
  return result;
}

export function base64ToBytes(b64: string): Uint8Array {
  let clean = b64.replace(/[^A-Za-z0-9+/]/g, '');
  const padding = b64.endsWith('==') ? 2 : b64.endsWith('=') ? 1 : 0;
  const byteLength = (clean.length * 3) / 4 - padding;
  const bytes = new Uint8Array(byteLength);
  let p = 0;
  for (let i = 0; i < clean.length; i += 4) {
    const c0 = LOOKUP[clean.charCodeAt(i)];
    const c1 = LOOKUP[clean.charCodeAt(i + 1)];
    const c2 = LOOKUP[clean.charCodeAt(i + 2)];
    const c3 = LOOKUP[clean.charCodeAt(i + 3)];
    if (p < byteLength) bytes[p++] = (c0 << 2) | (c1 >> 4);
    if (p < byteLength) bytes[p++] = ((c1 & 15) << 4) | (c2 >> 2);
    if (p < byteLength) bytes[p++] = ((c2 & 3) << 6) | c3;
  }
  return bytes;
}
