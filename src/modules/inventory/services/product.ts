import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class ProductService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getProducts() {
        return this.supabaseClient.from('product').select();
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
