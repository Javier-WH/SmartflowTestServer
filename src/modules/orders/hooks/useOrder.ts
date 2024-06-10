import { useEffect, useState } from 'react';
import OrdersService from '../services/order';

import supabase from '@/lib/supabase';
import type { Database } from '@/types/supabase';

const ordersService = new OrdersService(supabase);

type Order = Database['public']['Tables']['order']['Row'];

export default function useOrder() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [totalRecords, setTotalRecords] = useState(0);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();

    useEffect(() => {
        async function getOrders() {
            setIsLoading(true);
            try {
                const response = await ordersService.getOrders();
                const fetched_orders = response.data;

                if (fetched_orders) {
                    setOrders(fetched_orders);
                    setTotalRecords(response.count);
                }
                // biome-ignore lint/suspicious/noExplicitAny: This is a type-safe way to get the data from the response
            } catch (error: any) {
                if (error.message) setError(error.message);
                else setError(error);
            } finally {
                setIsLoading(false);
            }
        }

        getOrders();
    }, []);

    return {
        data: orders,
        totalRecords: totalRecords,
        isLoading,
        error,
    };
}
