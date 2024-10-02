import type { Database } from '@/types/supabase';
import type { TableColumn } from 'react-data-table-component';

export type Product = Database['public']['Tables']['product']['Row'];

export const products_table_columns: TableColumn<Product>[] = [
    {
        id: 'id',
        name: 'ID',
        selector: row => row.id,
        reorder: true,
        omit: false,
    },
    {
        id: 'name',
        name: 'Nombre',
        selector: row => row.name,
        sortable: false,
        reorder: true,
        omit: false,
    },
    {
        id: 'marketplace_sku',
        name: 'SKU Marketplace',
        selector: row => row.marketplace_product?.[0]?.marketplace_sku ?? '', // WARNING: This must be correctly handled as a list of skus, one per marketplace
        sortable: false,
        reorder: true,
        omit: false,
    },
    {
        id: 'price',
        name: 'Precio',
        selector: row => row.price,
        sortable: false,
        reorder: true,
        omit: false,
    },
    {
        id: 'created_at',
        name: 'Fecha Creación',
        selector: row => row.created_at,
        format: row => new Date(row.created_at).toLocaleDateString(),
        sortable: false,
        reorder: true,
        omit: false,
    },
];
