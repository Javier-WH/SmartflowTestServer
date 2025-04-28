import { useQuery, useUpdateMutation } from '@supabase-cache-helpers/postgrest-swr';
import supabase from '@/lib/supabase';

export default function useFileContent({ fileId }: { fileId: string }) {
    const {
        data: fileContent,
        isLoading,
        error,
        count,
    } = useQuery(supabase.from('filesquill').select('content, name, updated_at').eq('id', fileId).single(), {
        revalidateOnFocus: false,
        revalidateOnReconnect: false,
    });

    const { trigger: update, isMutating } = useUpdateMutation(
        supabase.from('filesquill'),
        ['id'],
        'content, name, updated_at',
    );
    //     const tableName = pageType === 'quill' ? 'filesquill' : 'files';
    // if (name === '') name = 'untitled';
    // const response = await supabase
    //   .from(tableName)
    //   .update({
    //     name,
    //     content
    //   })
    //   .eq('id', fileId)
    //   .select('content, name, updated_at')
    //   .single();

    return {
        data: fileContent,
        mutate: update,
        isMutating,
        isLoading,
        error,
        count,
    };
}
