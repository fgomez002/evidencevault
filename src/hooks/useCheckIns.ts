import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';

export interface CheckIn {
  id: string;
  user_id: string;
  scheduled_at: string;
  window_minutes: number;
  status: 'pending' | 'confirmed' | 'missed';
  notified_at: string | null;
  created_at: string;
}

const KEY = ['check_ins'];

export function useCheckIns() {
  return useQuery<CheckIn[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('check_ins')
        .select('*')
        .order('scheduled_at', { ascending: false });
      if (error) throw error;
      return (data ?? []) as CheckIn[];
    },
  });
}

export function useCreateCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: { scheduled_at: string; window_minutes: number }): Promise<CheckIn> => {
      const { data, error } = await supabase.from('check_ins').insert(input).select('*').single();
      if (error) throw error;
      return data as CheckIn;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateCheckInStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: CheckIn['status'] }) => {
      const { error } = await supabase.from('check_ins').update({ status }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteCheckIn() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('check_ins').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
