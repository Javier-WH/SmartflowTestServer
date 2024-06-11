import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import OrdersService from '../services/order';

const ordersService = new OrdersService(supabase);

export default function useOrder(
    { page, rowsPerPage }: { page?: number; rowsPerPage?: number } = {
        page: 1,
        rowsPerPage: 100,
    },
) {
    const { data: orders, isLoading, error, count, mutate } = useQuery(ordersService.getOrders({ page, rowsPerPage }));

    return {
        data: orders ?? [],
        totalRecords: count,
        isLoading,
        error: error?.message,
        mutate,
    };
}
