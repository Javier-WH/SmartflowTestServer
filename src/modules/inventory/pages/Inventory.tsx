import { type ChangeEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import Table from '@/modules/shared/components/Table/Table';
import { Button, Input, useDisclosure } from '@nextui-org/react';
import type { TableColumn } from 'react-data-table-component';

import SupplyProduct from './SupplyProduct';
import { MoveInventoryModal } from '../components/MoveInventoryModal';

import useProduct from '../hooks/useProduct';
import type { Product } from './inventory.data';

import { useDebouncedCallback } from 'use-debounce';

const ROWS_PER_PAGE = 100;

export default function Inventory() {
    const location = useLocation();
    const navigate = useNavigate();

    const { isOpen: supplyProductOpen, onOpenChange: supplyProductOnOpenChange } = useDisclosure();

    const urlSearchParams = new URLSearchParams(location.search);
    const parsedPage = Number.parseInt(urlSearchParams.get('page') ?? '1');
    const parsedRowsPerPage = Number.parseInt(urlSearchParams.get('rowsPerPage') ?? `${ROWS_PER_PAGE}`);

    const [selectedPage, setSelectedPage] = useState(parsedPage);
    const [rowsPerPage, setRowsPerPage] = useState(parsedRowsPerPage);
    const [searchTerm, setSearchTerm] = useState<string>('');
    const [moveInventoryProduct, setMoveInventoryProduct] = useState<Product | null>(null);

    const products_table_columns: TableColumn<Product>[] = [
        {
            id: 'id',
            name: 'ID',
            selector: row => row.id,
            width: 'max-content',
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
            width: 'max-content',
            selector: row => row.marketplace_product?.[0]?.marketplace_sku ?? '', // WARNING: This must be correctly handled as a list of skus, one per marketplace
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'price',
            name: 'Precio',
            width: 'max-content',
            selector: row => row.price ?? 0,
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'stock',
            name: 'Stock',
            width: 'max-content',
            selector: row => row.business_product.reduce((acc: number, curr: any) => acc + curr.stock, 0),
            format: (row: Product) => {
                return (
                    <Button
                        color="primary"
                        size="sm"
                        variant="light"
                        className="text-default-500"
                        onClick={() => setMoveInventoryProduct(row)}
                    >
                        {row.business_product.reduce((acc: number, curr: any) => acc + curr.stock, 0)}
                    </Button>
                );
            },
            sortable: false,
            reorder: true,
            omit: false,
        },
        // {
        //     id: 'created_at',
        //     name: 'Fecha Creación',
        //     selector: row => row.created_at,
        //     format: row => new Date(row.created_at).toLocaleDateString(),
        //     sortable: false,
        //     reorder: true,
        //     omit: false,
        // },
    ];

    const {
        data: products,
        totalRecords: totalProducts,
        mutate: updateProducts,
        isLoading: productsLoading,
    } = useProduct({
        page: selectedPage,
        rowsPerPage: rowsPerPage,
        search: searchTerm,
    });

    const handleSearchTermChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
        console.log('handleSearchTermChange', e.target.value);
        setSearchTerm(e.target.value);
    }, 500);

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
                        <div className="flex-grow max-w-[600px] mr-auto">
                            <Input
                                placeholder="Search..."
                                type="search"
                                inputMode="search"
                                color="default"
                                size="lg"
                                classNames={{ inputWrapper: 'shadow-lg bg-white' }}
                                radius="full"
                                onChange={handleSearchTermChange}
                                defaultValue={searchTerm}
                            />
                        </div>
                        <Button radius="full" color="default" onClick={supplyProductOnOpenChange}>
                            Abastecer SKU
                        </Button>
                    </div>
                }
            />

            {supplyProductOpen && (
                <SupplyProduct
                    isOpen={supplyProductOpen}
                    onClose={supplyProductOnOpenChange}
                    onSubmit={() => {
                        console.log('Updating products');
                        updateProducts();
                    }}
                />
            )}
            {moveInventoryProduct != null && (
                <MoveInventoryModal
                    product={moveInventoryProduct}
                    isOpen={moveInventoryProduct != null}
                    onOpenChange={() => setMoveInventoryProduct(null)}
                />
            )}
        </>
    );
}
