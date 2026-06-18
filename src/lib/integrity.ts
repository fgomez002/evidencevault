import { supabase } from './supabase';
import type { IntegrityAction } from './database.types';

/**
 * Append a chain-of-custody event. Best-effort: a logging failure should never
 * block the user's primary action, so errors are swallowed but surfaced to the
 * console. The integrity_log table is insert/select-only (see 0002_rls.sql).
 */
export async function logIntegrity(params: {
  entityType: 'incident' | 'evidence' | 'report' | 'witness';
  entityId: string;
  action: IntegrityAction;
  sha256Before?: string | null;
  sha256After?: string | null;
  deviceLabel?: string;
}): Promise<void> {
  try {
    const { error } = await supabase.from('integrity_log').insert({
      entity_type: params.entityType,
      entity_id: params.entityId,
      action: params.action,
      sha256_before: params.sha256Before ?? null,
      sha256_after: params.sha256After ?? null,
      device_label: params.deviceLabel ?? null,
    });
    if (error) console.warn('[integrity] log failed:', error.message);
  } catch (e) {
    console.warn('[integrity] log threw:', e);
  }
}
