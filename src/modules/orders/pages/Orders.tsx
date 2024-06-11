import { useState, useEffect } from 'react';
import TableV2 from '@/modules/shared/components/Table/TableV2';

import useOrder from '../hooks/useOrder';
import { orders_table_columns, orders_table_visible_columns } from './orders.data';
import { useLocation, useNavigate } from 'react-router-dom';

const ROWS_PER_PAGE = 100;

export default function Orders() {
    const location = useLocation();
    const navigate = useNavigate();

    const urlSearchParams = new URLSearchParams(location.search);
    const parsedPage = Number.parseInt(urlSearchParams.get('page') ?? '1', 10);
    const parsedRowsPerPage = Number.parseInt(urlSearchParams.get('rowsPerPage') ?? `${ROWS_PER_PAGE}`, 10);

    const [selectedPage, setSelectedPage] = useState(parsedPage);
    const [rowsPerPage, setRowsPerPage] = useState(parsedRowsPerPage);

    const { data: orders, totalRecords, isLoading } = useOrder({ page: selectedPage, rowsPerPage: rowsPerPage });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        if (parsedPage !== selectedPage) {
            searchParams.set('page', `${selectedPage}`);
            navigate({
                pathname: location.pathname,
                search: searchParams.toString(),
            });
        }

        if (parsedRowsPerPage !== rowsPerPage) {
            searchParams.set('rowsPerPage', `${rowsPerPage}`);
            navigate({
                pathname: location.pathname,
                search: searchParams.toString(),
            });
        }
    }, [selectedPage, rowsPerPage, location.pathname, location.search, navigate, parsedPage, parsedRowsPerPage]);

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
