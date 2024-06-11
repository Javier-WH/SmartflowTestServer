import { useState, useMemo, useEffect } from 'react';
import Table from '@/modules/shared/components/Table/Table';

import useOrder from '../hooks/useOrder';
import { type Order, orders_table_columns, orders_table_visible_columns } from './orders.data';
import { useLocation, useNavigate } from 'react-router-dom';
import type { ExpanderComponentProps } from 'react-data-table-component/dist/DataTable/types';
import { Button } from '@nextui-org/react';

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

    const exportData = useMemo(() => {
        if (!orders) return [];

        return orders?.map(order => ({
            ...order,
            marketplace_id: JSON.stringify(order.marketplace_id),
            internal_status_id: JSON.stringify(order.internal_status_id),
            shipping_info: JSON.stringify(order.shipping_info),
            order_lines: JSON.stringify(order.order_lines),
            charges: JSON.stringify(order.charges),
            tax: JSON.stringify(order.tax),
        }));
    }, [orders]);

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

    const ExpandedRowComponent: React.FC<ExpanderComponentProps<Order>> = ({ data }) => {
        const comission_amount = data.order_lines.reduce(
            (acc: number, orderLine: Order['order_lines'][0]) => acc + Number(orderLine.commission_amount),
            0,
        );
        return (
            <div className="w-full flex justify-end py-4">
                <div className="flex gap-20 px-20">
                    <div className="flex flex-col gap-4">
                        <small className="flex gap-8 truncate max-w-[400px]">
                            <span>URL Shipping</span>
                            <a
                                href={data.shipping_info?.shipping_tracking_url}
                                className="text-blue-600"
                                target="_blank"
                                rel="noreferrer"
                            >
                                {data.shipping_info?.shipping_tracking_url}
                            </a>
                        </small>
                        <small className="flex gap-[4.5rem] truncate">
                            <span>Guia #</span>
                            <span>{data.shipping_info?.shipping_tracking}</span>
                        </small>
                    </div>
                    <div className="flex flex-col gap-4">
                        <small className="truncate">Comisiones ${comission_amount}</small>
                        <Button size="sm" radius="full" color="primary">
                            Marcar como enviado
                        </Button>
                    </div>
                </div>
            </div>
        );
    };

    return (
        <Table
            tableId="orders-table-columns"
            data={orders}
            exportData={exportData}
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
            expandableRowsComponent={ExpandedRowComponent}
        />
    );
}
