import { useEffect, useState } from 'react';

import Table from '@/modules/shared/components/Table/Table';
import { Button, useDisclosure } from '@nextui-org/react';

import SupplyProduct from './SupplyProduct';

import useProduct from '../hooks/useProduct';
import { products_table_columns } from './inventory.data';
import { useLocation, useNavigate } from 'react-router-dom';

const ROWS_PER_PAGE = 100;

export default function Inventory() {
    const location = useLocation();
    const navigate = useNavigate();

    const { isOpen, onOpen, onOpenChange } = useDisclosure();

    const urlSearchParams = new URLSearchParams(location.search);
    const parsedPage = Number.parseInt(urlSearchParams.get('page') ?? '1');
    const parsedRowsPerPage = Number.parseInt(urlSearchParams.get('rowsPerPage') ?? `${ROWS_PER_PAGE}`);

    const [selectedPage, setSelectedPage] = useState(parsedPage);
    const [rowsPerPage, setRowsPerPage] = useState(parsedRowsPerPage);

    const {
        data: products,
        totalRecords: totalProducts,
        mutate: updateProducts,
        isLoading: productsLoading,
    } = useProduct({
        page: selectedPage,
        rowsPerPage: rowsPerPage,
    });

    useEffect(() => {
        const searchParams = new URLSearchParams(location.search);

        if (parsedPage !== selectedPage) {
            searchParams.set('page', `${selectedPage}`);
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedRowsPerPage !== rowsPerPage) {
            searchParams.set('rowsPerPage', `${rowsPerPage}`);
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }
    }, [selectedPage, rowsPerPage, location.pathname, location.search, navigate, parsedPage, parsedRowsPerPage]);

    return (
        <>
            <Table
                tableId="inventory-table-columns"
                data={products}
                exportData={products}
                columns={products_table_columns}
                loading={productsLoading}
                pagination
                paginationTotalRows={totalProducts || 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                onPaginationChange={setSelectedPage}
                page={selectedPage}
                sortServer
                exportToCsv
                initialVisibleColumns={[]}
                bottomSlot={
                    <div className="flex justify-center xl:justify-end items-center gap-4 flex-wrap">
                        <Button radius="full" color="default" onClick={onOpenChange}>
                            Abastecer SKU
                        </Button>
                    </div>
                }
            />

            {isOpen && (
                <SupplyProduct
                    isOpen={isOpen}
                    onClose={onOpenChange}
                    onSubmit={() => {
                        console.log('Updating products');
                        updateProducts();
                    }}
                />
            )}
        </>
    );
}
