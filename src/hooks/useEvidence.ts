import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import * as FileSystem from 'expo-file-system';
import { supabase, EVIDENCE_BUCKET } from '@/lib/supabase';
import { sha256OfFile } from '@/lib/hash';
import { encryptFileToUri, decryptFileToUri, randomId } from '@/lib/crypto';
import { base64ToBytes } from '@/lib/base64';
import { logIntegrity } from '@/lib/integrity';
import type { EvidenceFile, EvidenceKind } from '@/lib/database.types';

const KEY = ['evidence'];

export function useEvidenceList(incidentId?: string) {
  return useQuery<EvidenceFile[]>({
    queryKey: incidentId ? [...KEY, 'incident', incidentId] : KEY,
    queryFn: async () => {
      let q = supabase.from('evidence_files').select('*').order('captured_at', { ascending: false });
      if (incidentId) q = q.eq('incident_id', incidentId);
      const { data, error } = await q;
      if (error) throw error;
      return (data ?? []) as EvidenceFile[];
    },
  });
}

export interface UploadInput {
  uri: string;
  kind: EvidenceKind;
  mimeType?: string;
  filename?: string;
  caption?: string;
  incidentId?: string | null;
}

/**
 * The full secure ingest pipeline for one piece of evidence:
 *   1. SHA-256 the ORIGINAL bytes (chain-of-custody anchor)
 *   2. encrypt to a temp file (XSalsa20-Poly1305, device vault key)
 *   3. upload ciphertext to the private bucket under `<uid>/<id>.enc`
 *   4. insert metadata row + log a `created` integrity event
 */
export function useUploadEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: UploadInput): Promise<EvidenceFile> => {
      const { data: userData } = await supabase.auth.getUser();
      const uid = userData.user?.id;
      if (!uid) throw new Error('Not signed in.');

      const info = await FileSystem.getInfoAsync(input.uri, { size: true });
      const size = info.exists ? info.size ?? 0 : 0;

      // 1. hash original
      const sha256 = await sha256OfFile(input.uri);

      // 2. encrypt
      const id = randomId();
      const encUri = `${FileSystem.cacheDirectory}${id}.enc`;
      const encMeta = await encryptFileToUri(input.uri, encUri);

      // 3. upload ciphertext
      const storagePath = `${uid}/${id}.enc`;
      const cipherB64 = await FileSystem.readAsStringAsync(encUri, {
        encoding: FileSystem.EncodingType.Base64,
      });
      const bytes = base64ToBytes(cipherB64);
      const { error: upErr } = await supabase.storage
        .from(EVIDENCE_BUCKET)
        .upload(storagePath, bytes, {
          contentType: 'application/octet-stream',
          upsert: false,
        });
      await FileSystem.deleteAsync(encUri, { idempotent: true });
      if (upErr) throw upErr;

      // 4. metadata row
      const { data, error } = await supabase
        .from('evidence_files')
        .insert({
          id,
          incident_id: input.incidentId ?? null,
          kind: input.kind,
          storage_path: storagePath,
          original_filename: input.filename ?? null,
          mime_type: input.mimeType ?? null,
          size_bytes: size,
          sha256,
          enc_metadata: encMeta as unknown as Record<string, unknown>,
          caption: input.caption ?? null,
        })
        .select('*')
        .single();
      if (error) throw error;

      await logIntegrity({
        entityType: 'evidence',
        entityId: id,
        action: 'created',
        sha256After: sha256,
      });
      return data as EvidenceFile;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

/**
 * Download + decrypt an evidence file to a temporary local uri for viewing.
 * Also re-verifies the SHA-256 and logs a `viewed` event.
 */
export async function openEvidence(file: EvidenceFile): Promise<{ uri: string; verified: boolean }> {
  const { data, error } = await supabase.storage
    .from(EVIDENCE_BUCKET)
    .download(file.storage_path);
  if (error) throw error;

  const cipherB64 = await blobToBase64(data);
  const cipherUri = `${FileSystem.cacheDirectory}view_${file.id}.enc`;
  await FileSystem.writeAsStringAsync(cipherUri, cipherB64, {
    encoding: FileSystem.EncodingType.Base64,
  });

  const outUri = `${FileSystem.cacheDirectory}view_${file.id}`;
  await decryptFileToUri(cipherUri, outUri, file.enc_metadata as any);
  await FileSystem.deleteAsync(cipherUri, { idempotent: true });

  const checkHash = await sha256OfFile(outUri);
  const verified = checkHash === file.sha256;

  await logIntegrity({ entityType: 'evidence', entityId: file.id, action: 'viewed' });
  return { uri: outUri, verified };
}

export function useDeleteEvidence() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (file: EvidenceFile) => {
      await supabase.storage.from(EVIDENCE_BUCKET).remove([file.storage_path]);
      const { error } = await supabase.from('evidence_files').delete().eq('id', file.id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

// ---- helpers ----
function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const result = reader.result as string;
      resolve(result.split(',')[1] ?? '');
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}
