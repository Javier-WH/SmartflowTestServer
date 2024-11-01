import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class ProductService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getProducts({ page, rowsPerPage, search }: { page?: number; rowsPerPage?: number; search?: string }) {
        let offset: number | undefined;
        let limit: number | undefined;

        if (page && rowsPerPage) {
            offset = (page - 1) * rowsPerPage;
            limit = rowsPerPage;
        }

        let query = this.supabaseClient.from('product').select(
            `
                    id,
                    name,
                    marketplace_product!inner(marketplace_sku),
                    brand,
                    type,
                    currency,
                    price,
                    upc,
                    ean,
                    gtin,
                    status,
                    active,
                    created_at
                    `,
            offset !== undefined && limit !== undefined ? { count: 'estimated' } : {},
        );

        if (offset !== undefined && limit !== undefined) {
            query = query.range(offset, offset + limit - 1);
        }

        if (search) {
            query = query.or(`name.ilike.%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        return query;
    }

    async createProduct({
        sku,
        name,
        brand,
        price,
        ean,
        marketplace_id,
        marketplace_sku,
    }: {
        sku: string;
        name: string;
        brand: string;
        price: number;
        ean: string;
        marketplace_id: string;
        marketplace_sku: string;
    }) {
        return this.supabaseClient.rpc('create_product', {
            internal_sku: sku,
            marketplace_id,
            marketplace_sku,
            name,
            brand,
            price,
            ean,
        });
    }
}

export default ProductService;
