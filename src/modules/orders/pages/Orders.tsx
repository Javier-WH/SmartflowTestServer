import Table from '@/modules/shared/components/Table/Table';

import useOrder from '../hooks/useOrder';
import { orders_table_columns, orders_table_visible_columns } from './orders.data';
import { getNestedProperty } from '@/modules/shared/components/Table/utils';

export default function Orders() {
    const { data: orders, totalRecords, isLoading, error } = useOrder();

    return (
        <div className="h-full">
            <Table
                data={orders}
                columns={orders_table_columns}
                sortDescriptor={{ column: 'created_at', direction: 'descending' }}
                initialVisibleColumns={orders_table_visible_columns}
                renderCell={(item, columnKey) => {
                    const columns = columnKey.toString().split('.');

                    const text = getNestedProperty(item, columns) || '';

                    return <span>{text}</span>;
                }}
                onSearch={() => []}
                filterElement={<div>Filters</div>}
                rowsPerPage={100}
                totalRecords={totalRecords}
                onPageChange={page => console.log(page)}
                isLoading={isLoading}
                error={error}
            />
        </div>
    );
}
