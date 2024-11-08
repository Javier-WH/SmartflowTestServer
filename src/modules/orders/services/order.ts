import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';
import { parseDate } from '@internationalized/date';
import type { AcknowledgeableOrderList, ShippingLabelOrder } from '../types/types';

class OrderService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getOrders({
        page = 1,
        rowsPerPage = 50,
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
    }) {
        const offset = (page - 1) * rowsPerPage;
        const limit = rowsPerPage;

        let query = this.supabaseClient
            .from('order')
            .select(
                `
            id,
            marketplace_id (id, name),
            order_id,
            created_at,
            shipping_info,
            total_lines,
            total_quantity,
            currency,
            total,
            marketplace_status,
            internal_status_id (id, status, name),
            order_lines,
            charges,
            tax,
            internal_last_updated_date
        `,
                { count: 'estimated' },
            )
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });

        if (status_id != null) {
            query = query.in('internal_status_id', [status_id]);
        }

        if (marketplace_id != null) {
            query = query.eq('marketplace_id', marketplace_id);
        }

        if (from != null && to != null) {
            const newTo = parseDate(to).add({ days: 1 }).toString();

            query = query.gt('created_at', from).lt('created_at', newTo);
        }

        if (search != null && search !== '') {
            query = query.or(`order_id.like.%${search}%, total.like.%${search}%`);
        }

        return query;
    }

    async acknowledgeOrders(orders: AcknowledgeableOrderList) {
        const { data, error } = await this.supabaseClient.functions.invoke('acknowledge-order', {
            method: 'POST',
            headers: {
                Accept: 'application/json',
            },
            body: { orders },
        });

        if (error) {
            try {
                if (error.context.json) {
                    const { errors } = (await error.context.json()) ?? {};
                    return [errors, null];
                }

                if (error.context.message) {
                    return [error.context.message, null];
                }
            } catch (error: any) {
                return [error.message, null];
            }
        }

        return [null, data];
    }

    async downloadShippingLabels(tracking_numbers: ShippingLabelOrder) {
        const { data, error } = await this.supabaseClient.functions.invoke('shipping-label', {
            method: 'POST',
            body: { tracking_numbers },
        });

        if (error) {
            try {
                if (error.context.json) {
                    const { errors } = (await error.context.json()) ?? {};
                    return [errors, null];
                }

                if (error.context.message) {
                    return [error.context.message, null];
                }
            } catch (error: any) {
                return [error.message, null];
            }
        }

        console.log('[LS] -> src/modules/orders/services/order.ts:110 -> data: ', data);

        return [null, data];
    }
}

export default OrderService;
