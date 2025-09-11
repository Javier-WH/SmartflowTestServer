import { useQuery, useUpdateMutation } from '@supabase-cache-helpers/postgrest-swr';
import supabase from '@/lib/supabase';

export default function useFileContent({ fileId }: { fileId: string }) {
    const {
        data: fileContent,
        isLoading,
        error,
        count,
    } = useQuery(supabase.from('filesquill').select('content, name, updated_at').eq('id', fileId).single(), {
        revalidateOnFocus: true,
        revalidateOnReconnect: true,
        revalidateIfStale: true
    });

    const { trigger: update, isMutating } = useUpdateMutation(
        supabase.from('filesquill'),
        ['id'],
        'content, name, updated_at',
    );


    return {
        data: fileContent,
        mutate: update,
        isMutating,
        isLoading,
        error,
        count,
    };
}
