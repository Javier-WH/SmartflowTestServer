import type { TableColumn } from '@/modules/shared/types/table';
import type { Database } from '@/types/supabase';

export const orders_table_columns: TableColumn<keyof Database['public']['Tables']['order']['Row']>[] = [
    {
        title: 'ID',
        uid: 'id',
        sortable: false,
    },
    {
        title: '# PEDIDO',
        uid: 'order_id',
        sortable: false,
    },
    {
        title: 'FECHA',
        uid: 'created_at',
        format: (value: string) => new Date(value).toLocaleDateString('es-ES'),
        sortable: false,
    },
    {
        title: 'MARKETPLACE',
        uid: 'marketplace_id.name',
        sortable: false,
    },
    {
        title: 'MARKETPLACE STATUS',
        uid: 'marketplace_status',
        sortable: false,
    },
    {
        title: 'INTERNAL STATUS',
        uid: 'internal_status_id.status',
        sortable: false,
    },
    {
        title: 'TOTAL',
        uid: 'total',
        sortable: false,
    },
];

export const orders_table_visible_columns: Array<keyof Database['public']['Tables']['order']['Row']> = [
    'id',
    'order_id',
    'created_at',
    'marketplace_id.name',
    'marketplace_status',
    'internal_status_id.status',
    'total',
];
