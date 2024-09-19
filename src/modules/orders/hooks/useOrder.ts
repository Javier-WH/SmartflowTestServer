import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import OrderService from '../services/order';
import type { AcknowledgeableOrderList } from '../types/types';

const ordersService = new OrderService(supabase);

export default function useOrder(
    {
        page,
        rowsPerPage,
        status_id,
        marketplace_id,
        from,
        to,
        search,
    }: {
        page?: number;
        rowsPerPage?: number;
        status_id?: string | number | null;
        marketplace_id?: string | number | null;
        from?: string | null;
        to?: string | null;
        search?: string;
    } = {
        page: 1,
        rowsPerPage: 100,
        status_id: null,
        marketplace_id: null,
        from: null,
        to: null,
        search: '',
    },
) {
    const {
        data: orders,
        isLoading,
        error,
        count,
        mutate,
    } = useQuery(ordersService.getOrders({ page, rowsPerPage, status_id, marketplace_id, from, to, search }));

    async function acknowledgeOrders(orders: AcknowledgeableOrderList) {
        const [error, data] = await ordersService.acknowledgeOrders(orders);

        if (error) {
            return [error, null];
        }

        return [null, data];
    }

    return {
        data: orders,
        totalRecords: count,
        isLoading,
        error: error?.message,
        mutate,
        acknowledgeOrders,
    };
}
