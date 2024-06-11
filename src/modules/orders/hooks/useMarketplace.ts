import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import MarketplaceService from '../services/marketplace';

const marketplaceService = new MarketplaceService(supabase);

export default function useMarketplace() {
    const { data: marketplaces, isLoading, error, mutate } = useQuery(marketplaceService.getMarketplaces());

    return {
        data: marketplaces ?? [],
        isLoading,
        error: error?.message,
        mutate,
    };
}
