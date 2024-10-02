import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class ProductService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getProducts({ page, rowsPerPage }: { page: number; rowsPerPage: number }) {
        const offset = (page - 1) * rowsPerPage;
        const limit = rowsPerPage;

        return this.supabaseClient
            .from('product')
            .select(
                `
                    id,
                    name,
                    marketplace_product (marketplace_sku),
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
                { count: 'estimated' },
            )
            .range(offset, offset + limit - 1)
            .order('created_at', { ascending: false });
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
