import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class OrdersService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getOrders({ page = 1, rowsPerPage = 50 }: { page?: number; rowsPerPage?: number }) {
        const offset = page * rowsPerPage;
        const limit = rowsPerPage;

        return this.supabaseClient
            .from('order')
            .select(
                `
            id,
            marketplace_id (name),
            order_id,
            created_at,
            shipping_info,
            total_lines,
            total_quantity,
            currency,
            total,
            marketplace_status,
            internal_status_id (status),
            order_lines,
            charges,
            tax,
            internal_last_updated_date
        `,
                { count: 'estimated' },
            )
            .order('created_at', { ascending: false })
            .range(offset, offset + limit - 1);
    }
}

export default OrdersService;
