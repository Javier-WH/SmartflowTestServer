import { useState, useMemo, type ChangeEvent } from 'react';
import { RotateCw, Columns, Download } from 'react-feather';
import DataTable, { type SortOrder, type TableColumn } from 'react-data-table-component';
import Pagination from './Pagination';
import { CSVLink } from 'react-csv';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner } from '@nextui-org/react';

function TableV2({
    tableId,
    pagination = true,
    columns,
    loading = false,
    sortServer,
    data = [],
    paginationPerPageOptions = [50, 100, 300, 500],
    paginationTotalRows = 0,
    onRowsPerPageChange = () => {},
    onPaginationChange = () => {},
    onRowClicked = () => {},
    onSort = () => {},
    exportToCsv = false,
    exportData,
    actions,
    onRefresh,
    rowsPerPage = 50,
    page = 1,
    initialVisibleColumns = [],
}: {
    tableId: string;
    pagination?: boolean;
    columns: TableColumn<any>[];
    loading?: boolean;
    sortServer?: boolean;
    data?: any[];
    paginationPerPageOptions?: number[];
    paginationTotalRows?: number;
    onRowsPerPageChange?: (rowsPerPage: number) => void;
    onPaginationChange?: (page: number) => void;
    onRowClicked?: (row: any) => void;
    onSort?: (selectedColumn: TableColumn<any>, sortDirection: SortOrder, sortedRows: any[]) => void;
    exportToCsv?: boolean;
    exportData?: any[];
    actions?: React.ReactElement;
    onRefresh?: () => void;
    rowsPerPage?: number;
    page?: number;
    initialVisibleColumns?: string[];
}) {
    const storedVisibility = localStorage.getItem(`${tableId}-columns-visibility`);
    const persistedVisibility = storedVisibility ? JSON.parse(storedVisibility) : new Set(initialVisibleColumns);

    const [tableColumns, setTableColumns] = useState(columns);
    const [visibleColumns, setVisibleColumns] = useState(persistedVisibility);

    const headerColumns = useMemo(() => {
        if (visibleColumns === 'all') return tableColumns;

        const storedColumnsOrder = localStorage.getItem(`${tableId}-columns-order`);
        const persistedColumnsOrder = storedColumnsOrder ? JSON.parse(storedColumnsOrder) : null;

        let newColumns = columns;

        if (persistedColumnsOrder) {
            newColumns = persistedColumnsOrder.map((columnId: string) => {
                const column = columns.find(col => col.id === columnId);

                if (column) {
                    column.omit =
                        persistedVisibility?.find((col: { id: string; omit: boolean }) => col.id === columnId)?.omit ??
                        false;
                }

                return column;
            });
        }

        return newColumns;
    }, [visibleColumns, tableColumns, tableId, columns, persistedVisibility]);

    const handleRowsPerPageChange = (e: ChangeEvent<HTMLSelectElement>) => {
        const rowsPerPage = Number(e.target.value);

        onRowsPerPageChange(rowsPerPage);
    };

    const handlePaginationChange = (page: number) => {
        onPaginationChange(page);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col lg:flex-row gap-3">
                {pagination && (
                    <div className="flex flex-col justify-end items-center">
                        {/* <label htmlFor='rows-per-page'>{t('show')}</label> */}
                        <label className="flex items-center text-default-400 text-small">
                            Rows per page:
                            <select
                                className="bg-transparent outline-none text-default-400 text-sm"
                                onChange={handleRowsPerPageChange}
                                value={rowsPerPage}
                            >
                                {paginationPerPageOptions.map(rowsPerPage => (
                                    <option key={rowsPerPage} value={rowsPerPage}>
                                        {rowsPerPage}
                                    </option>
                                ))}
                            </select>
                        </label>
                    </div>
                )}
                <div className="flex-grow">{actions}</div>
                <div className="flex justify-end items-center w-max">
                    {onRefresh && <RotateCw role="button" onClick={onRefresh} />}

                    {exportToCsv && (
                        <CSVLink
                            data={exportData ?? data}
                            filename={`${Intl.DateTimeFormat('es-MX', {
                                dateStyle: 'medium',
                                timeStyle: 'short',
                            }).format(new Date())}.csv`}
                            target="_blank"
                        >
                            <Button variant="light" className="px-0" size="sm">
                                <Download />
                            </Button>
                        </CSVLink>
                    )}
                    <Dropdown>
                        <DropdownTrigger className="hidden sm:flex">
                            <Button variant="light" className="px-0" size="sm">
                                <Columns />
                            </Button>
                        </DropdownTrigger>
                        <DropdownMenu
                            disallowEmptySelection
                            aria-label="Table Columns"
                            closeOnSelect={false}
                            selectedKeys={visibleColumns?.map((col: { id: string }) => col.id) ?? []}
                            selectionMode="multiple"
                            onSelectionChange={keys => {
                                setVisibleColumns(keys);
                                const columnKeys = Array.from(keys);

                                const columnsToPersist = tableColumns.map(col => {
                                    return {
                                        id: col.id,
                                        omit: !columnKeys.includes(col.id as string),
                                    };
                                });

                                localStorage.setItem(`${tableId}-columns-visibility`, JSON.stringify(columnsToPersist));

                                setVisibleColumns(columnsToPersist);
                            }}
                        >
                            {columns.map(column => (
                                <DropdownItem key={column.id} className="capitalize">
                                    {column.name}
                                </DropdownItem>
                            ))}
                        </DropdownMenu>
                    </Dropdown>
                </div>
            </div>
            <div className="flex-grow bg-white mt-1 rounded-3xl overflow-y-hidden h-full shadow-lg">
                <DataTable
                    data={data}
                    striped
                    selectableRows
                    fixedHeader
                    fixedHeaderScrollHeight="calc(100vh - 21rem)"
                    persistTableHead
                    highlightOnHover
                    columns={headerColumns}
                    progressPending={loading}
                    className="h-full"
                    progressComponent={<Spinner size="lg" />}
                    onRowClicked={onRowClicked}
                    onColumnOrderChange={cols => {
                        localStorage.setItem(`${tableId}-columns-order`, JSON.stringify(cols.map(col => col.id)));
                        setTableColumns(cols);
                    }}
                    onSort={onSort}
                    sortServer={sortServer}
                    noDataComponent={<span className="text-center h-full">No hay datos</span>}
                />
            </div>
            <div className="">
                <Pagination
                    rowsPerPage={rowsPerPage}
                    totalPages={Math.ceil(paginationTotalRows / rowsPerPage)}
                    currentPage={page}
                    onPageChange={handlePaginationChange}
                    totalEntries={paginationTotalRows}
                />
            </div>
        </div>
    );
}

export default TableV2;
