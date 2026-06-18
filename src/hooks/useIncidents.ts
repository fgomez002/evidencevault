import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logIntegrity } from '@/lib/integrity';
import { sha256OfString } from '@/lib/hash';
import type { Incident } from '@/lib/database.types';

const KEY = ['incidents'];

export function useIncidents() {
  return useQuery<Incident[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .order('occurred_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Incident[];
    },
  });
}

export function useIncident(id: string | undefined) {
  return useQuery<Incident>({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('incidents')
        .select('*')
        .eq('id', id!)
        .single();
      if (error) throw error;
      return data as Incident;
    },
  });
}

export type IncidentInput = Pick<
  Incident,
  | 'occurred_at' | 'category' | 'title' | 'notes' | 'emotional_impact'
  | 'follow_up_actions' | 'latitude' | 'longitude' | 'location_label'
>;

export function useCreateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: IncidentInput): Promise<Incident> => {
      const { data, error } = await supabase
        .from('incidents')
        .insert(input)
        .select('*')
        .single();
      if (error) throw error;
      const row = data as Incident;
      // Record creation in the chain-of-custody with a content fingerprint.
      const fingerprint = await sha256OfString(
        JSON.stringify({ t: row.title, n: row.notes, c: row.category, o: row.occurred_at }),
      );
      await logIntegrity({
        entityType: 'incident',
        entityId: row.id,
        action: 'created',
        sha256After: fingerprint,
      });
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<IncidentInput> }) => {
      const { data, error } = await supabase
        .from('incidents')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      await logIntegrity({ entityType: 'incident', entityId: id, action: 'modified' });
      return data as Incident;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteIncident() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('incidents').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
