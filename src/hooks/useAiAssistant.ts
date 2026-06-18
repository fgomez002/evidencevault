import { useMutation } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Incident, EvidenceFile } from '@/lib/database.types';

export type AiTask = 'summarize' | 'patterns' | 'report';

/** Assemble a plain-text corpus from records for the AI to reason over. */
export function buildContext(incidents: Incident[], evidence: EvidenceFile[]): string {
  const lines: string[] = [];
  for (const i of incidents) {
    lines.push(
      `INCIDENT [${new Date(i.occurred_at).toLocaleString()}] (${i.category}) ${i.title}` +
        (i.location_label ? ` @ ${i.location_label}` : '') +
        (i.notes ? `\n  Notes: ${i.notes}` : '') +
        (i.emotional_impact ? `\n  Impact: ${i.emotional_impact}` : '') +
        (i.follow_up_actions ? `\n  Follow-up: ${i.follow_up_actions}` : ''),
    );
  }
  for (const e of evidence) {
    lines.push(
      `EVIDENCE [${new Date(e.captured_at).toLocaleString()}] (${e.kind}) ${e.caption || e.original_filename || ''}`.trim(),
    );
  }
  return lines.join('\n');
}

export function useAiAssistant() {
  return useMutation({
    mutationFn: async (params: { task: AiTask; context: string; rangeLabel?: string }): Promise<string> => {
      const { data, error } = await supabase.functions.invoke('ai-assistant', {
        body: params,
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return (data?.text as string) ?? '';
    },
  });
}
