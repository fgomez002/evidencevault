import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logIntegrity } from '@/lib/integrity';
import type { Witness } from '@/lib/database.types';

const KEY = ['witnesses'];

export type WitnessInput = Pick<
  Witness,
  'name' | 'phone' | 'email' | 'event_date' | 'written_statement' | 'notes'
>;

export function useWitnesses() {
  return useQuery<Witness[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('witnesses')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as Witness[];
    },
  });
}

export function useWitness(id: string | undefined) {
  return useQuery<Witness>({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('witnesses').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Witness;
    },
  });
}

export function useCreateWitness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: WitnessInput): Promise<Witness> => {
      const { data, error } = await supabase.from('witnesses').insert(input).select('*').single();
      if (error) throw error;
      const row = data as Witness;
      await logIntegrity({ entityType: 'witness', entityId: row.id, action: 'created' });
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateWitness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<WitnessInput> }) => {
      const { data, error } = await supabase
        .from('witnesses')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      await logIntegrity({ entityType: 'witness', entityId: id, action: 'modified' });
      return data as Witness;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteWitness() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('witnesses').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
