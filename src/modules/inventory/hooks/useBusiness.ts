import supabase from '@/lib/supabase';

import BusinessService from '../services/business';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

const businessService = new BusinessService(supabase);

export default function useBusiness() {
    const { data: businesses, isLoading, error } = useQuery(businessService.getBusinesses());

    return {
        data: businesses,
        isLoading,
        error: error?.message,
    };
}
