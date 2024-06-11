import type { TableColumn } from 'react-data-table-component';
import type { Database } from '@/types/supabase';

type Order = Database['public']['Tables']['order']['Row'] & {
    marketplace_id: {
        name: string;
    };
    internal_status_id: {
        status: string;
    };
};

export const orders_table_columns: TableColumn<Order>[] = [
    {
        id: 'id',
        name: 'ID',
        selector: row => row.id,
        reorder: true,
        omit: false,
    },
    {
        id: 'order_id',
        name: '# PEDIDO',
        selector: row => row.order_id,
        sortable: false,
        reorder: true,
        omit: false,
    },
    {
        id: 'created_at',
        name: 'FECHA',
        selector: row =>
            Intl.DateTimeFormat('es-MX', {
                dateStyle: 'medium',
                timeStyle: 'short',
            }).format(new Date(row.created_at)),
        reorder: true,
        omit: false,
    },
    {
        id: 'marketplace_id.name',
        name: 'MARKETPLACE',
        selector: row => row.marketplace_id?.name,
        reorder: true,
        omit: false,
    },
    {
        id: 'marketplace_status',
        name: 'MARKETPLACE STATUS',
        selector: row => row.marketplace_status,
        reorder: true,
        omit: false,
    },
    {
        id: 'internal_status_id.status',
        name: 'INTERNAL STATUS',
        selector: row => row.internal_status_id?.status,
        reorder: true,
        omit: false,
    },
    {
        id: 'total',
        name: 'TOTAL',
        selector: row => row.total,
        reorder: true,
        omit: false,
    },
];

export const orders_table_visible_columns = [
    {
        id: 'order_id',
        omit: false,
    },
    {
        id: 'created_at',
        omit: false,
    },
    {
        id: 'marketplace_id.name',
        omit: false,
    },
    {
        id: 'marketplace_status',
        omit: false,
    },
    {
        id: 'internal_status_id.status',
        omit: false,
    },
    {
        id: 'total',
        omit: false,
    },
];
