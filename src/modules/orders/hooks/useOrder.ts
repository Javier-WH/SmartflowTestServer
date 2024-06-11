import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import OrderService from '../services/order';

const ordersService = new OrderService(supabase);

export default function useOrder(
    {
        page,
        rowsPerPage,
        status_id,
        marketplace_id,
        from,
        to,
    }: {
        page?: number;
        rowsPerPage?: number;
        status_id?: string | number | null;
        marketplace_id?: string | number | null;
        from?: string | null;
        to?: string | null;
    } = {
        page: 1,
        rowsPerPage: 100,
        status_id: null,
        marketplace_id: null,
        from: null,
        to: null,
    },
) {
    const {
        data: orders,
        isLoading,
        error,
        count,
        mutate,
    } = useQuery(ordersService.getOrders({ page, rowsPerPage, status_id, marketplace_id, from, to }));

    return {
        data: orders ?? [],
        totalRecords: count,
        isLoading,
        error: error?.message,
        mutate,
    };
}
