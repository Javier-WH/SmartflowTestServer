import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import StatusService from '../services/status';

const statusService = new StatusService(supabase);

export default function useStatus() {
    const { data: status, isLoading, error, mutate } = useQuery(statusService.getStatus());

    return {
        data: status ?? [],
        isLoading,
        error: error?.message,
        mutate,
    };
}
