import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/lib/supabase';
import type { Contact } from '@/lib/database.types';

const KEY = ['contacts'];

export type ContactInput = Pick<
  Contact,
  'name' | 'relationship' | 'phone' | 'email' | 'is_panic_recipient' | 'notes'
>;

export function useContacts() {
  return useQuery<Contact[]>({
    queryKey: KEY,
    queryFn: async () => {
      const { data, error } = await supabase
        .from('contacts')
        .select('*')
        .order('name', { ascending: true });
      if (error) throw error;
      return (data ?? []) as Contact[];
    },
  });
}

export function useContact(id: string | undefined) {
  return useQuery<Contact>({
    queryKey: [...KEY, id],
    enabled: !!id,
    queryFn: async () => {
      const { data, error } = await supabase.from('contacts').select('*').eq('id', id!).single();
      if (error) throw error;
      return data as Contact;
    },
  });
}

export function useCreateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (input: ContactInput): Promise<Contact> => {
      const { data, error } = await supabase.from('contacts').insert(input).select('*').single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useUpdateContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, input }: { id: string; input: Partial<ContactInput> }) => {
      const { data, error } = await supabase
        .from('contacts')
        .update(input)
        .eq('id', id)
        .select('*')
        .single();
      if (error) throw error;
      return data as Contact;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}

export function useDeleteContact() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase.from('contacts').delete().eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: KEY }),
  });
}
