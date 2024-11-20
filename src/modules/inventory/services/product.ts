import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface InventorySkuChange {
    sku: string;
    quantity: number;
    business_id?: number;
}

class ProductService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getProducts({
        page,
        rowsPerPage,
        search,
        single,
    }: { page?: number; rowsPerPage?: number; search?: string; single?: boolean }) {
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
                    business_product!inner(id, business_id (name), stock),
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
            // query = query.or(
            //     `name.ilike.%${search}%, upc.ilike.%${search}%, ean.ilike.%${search}%, gtin.ilike.%${search}%`,
            // );

            query = query.ilike('marketplace_product.marketplace_sku', `%${search}%`);
        }

        query = query.order('created_at', { ascending: false });

        if (single) {
            return query.maybeSingle();
        }

        return query;
    }

    // async createProduct({
    //     sku,
    //     name,
    //     brand,
    //     price,
    //     ean,
    //     marketplace_id,
    //     marketplace_sku,
    // }: {
    //     sku: string;
    //     name: string;
    //     brand: string;
    //     price: number;
    //     ean: string;
    //     marketplace_id: number;
    //     marketplace_sku: string;
    // }) {
    //     return this.supabaseClient.rpc('create_product', {
    //         internal_sku: sku,
    //         product_marketplace_id: marketplace_id,
    //         product_marketplace_sku: marketplace_sku,
    //         product_name: name,
    //         brand,
    //         price,
    //         product_ean: ean,
    //     });
    // }

    async sumInventory({ sku_list }: { sku_list: Array<InventorySkuChange> }) {
        const response = await this.supabaseClient.functions.invoke('inventory', {
            body: { sku_list, action: 'add' },
        });

        return response;
    }

    async substractInventory({ sku_list }: { sku_list: Array<InventorySkuChange> }) {
        const response = await this.supabaseClient.functions.invoke('inventory', {
            body: { sku_list, action: 'substract' },
        });

        return response;
    }
}

export default ProductService;
