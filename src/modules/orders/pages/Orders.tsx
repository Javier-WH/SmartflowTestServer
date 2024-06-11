import { useState } from 'react';
import TableV2 from '@/modules/shared/components/Table/TableV2';

import useOrder from '../hooks/useOrder';
import { orders_table_columns, orders_table_visible_columns } from './orders.data';

const ROWS_PER_PAGE = 100;

export default function Orders() {
    const [selectedPage, setSelectedPage] = useState(1);
    const [rowsPerPage, setRowsPerPage] = useState(ROWS_PER_PAGE);

    const { data: orders, totalRecords, isLoading } = useOrder({ page: selectedPage, rowsPerPage: rowsPerPage });

    return (
        <TableV2
            tableId="orders-table-columns"
            data={orders}
            columns={orders_table_columns}
            loading={isLoading}
            pagination
            paginationTotalRows={totalRecords || 0}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={setRowsPerPage}
            onPaginationChange={setSelectedPage}
            page={selectedPage}
            sortServer
            exportToCsv
            // actions={<div className="flex justify-end bg-red-500">Filters</div>}
            initialVisibleColumns={orders_table_visible_columns}
        />
    );
}
