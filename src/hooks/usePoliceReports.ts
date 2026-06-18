import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import { logIntegrity } from '@/lib/integrity';
import type { PoliceReport } from '@/lib/database.types';

const KEY = ['police_reports'];

export type PoliceReportInput = Pick<
  PoliceReport,
  | 'report_number' | 'agency' | 'officer_name' | 'officer_badge'
  | 'filed_at' | 'status' | 'follow_up_notes' | 'incident_id'
>;

export function usePoliceReports() {
  return useQuery<PoliceReport[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('police_reports')
        .select('*')
        .order('filed_at', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return (data ?? []) as PoliceReport[];
    },
  });
}

export function usePoliceReport(id: string | undefined) {
  return useQuery<PoliceReport>({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('police_reports').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as PoliceReport;
    },
  });
}

export function useCreatePoliceReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: PoliceReportInput): Promise<PoliceReport> => {
      const { data, error } = await supabase.from('police_reports').insert(input).select('*').single();
      if (error) throw error;
      const row = data as PoliceReport;
      await logIntegrity({ entityType: 'report', entityId: row.id, action: 'created' });
      return row;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdatePoliceReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<PoliceReportInput> }) => {
      const { data, error } = await supabase
        .from('police_reports')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      await logIntegrity({ entityType: 'report', entityId: id, action: 'modified' });
      return data as PoliceReport;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeletePoliceReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('police_reports').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
