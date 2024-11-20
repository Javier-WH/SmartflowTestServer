import type { Database } from '@/types/supabase';
import type { TableColumn } from 'react-data-table-component';

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
