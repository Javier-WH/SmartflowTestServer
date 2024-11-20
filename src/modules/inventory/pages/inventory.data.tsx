import type { Database } from '@/types/supabase';

export type Product = Database['public']['Tables']['product']['Row'] & {
    marketplace_product: Array<{
        marketplace_sku: string;
    }>;
    business_product: Array<{
        id: number;
        name: string;
        business_id: {
            name: string;
        };
        stock: number;
    }>;
};

export type SupplyProduct = Product & {
    business: { name: string; id: number };
    quantity: number;
};
