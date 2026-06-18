import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { IntegrityLogRow } from '@/lib/database.types';

export function useIntegrityLog() {
  return useQuery<IntegrityLogRow[]>({
    queryKey: ['integrity_log'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('integrity_log')
        .select('*')
        .order('occurred_at', { ascending: false })
        .limit(1000);
      if (error) throw error;
      return (data ?? []) as IntegrityLogRow[];
    },
  });
}
