import { useState, useMemo } from 'react';
import { RotateCw, Columns, Download } from 'react-feather';
import DataTable, { type SortOrder, type TableColumn } from 'react-data-table-component';
import Pagination from './Pagination';
import { CSVLink } from 'react-csv';
import { Button, Dropdown, DropdownItem, DropdownMenu, DropdownTrigger, Spinner } from '@nextui-org/react';
import type { ExpandableRowsComponent } from 'react-data-table-component/dist/DataTable/types';

function Table({
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
    upperSlot,
    bottomSlot,
    onRefresh,
    rowsPerPage = 50,
    page = 1,
    initialVisibleColumns = [],
    expandableRowsComponent,
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
    upperSlot?: React.ReactElement;
    bottomSlot?: React.ReactElement;
    onRefresh?: () => void;
    rowsPerPage?: number;
    page?: number;
    initialVisibleColumns?: Array<{ id: string; omit: boolean }>;
    expandableRowsComponent?: ExpandableRowsComponent<any>;
}) {
    const storedVisibility = localStorage.getItem(`${tableId}-columns-visibility`);
    const persistedVisibility = storedVisibility ? JSON.parse(storedVisibility) : initialVisibleColumns;

    const [tableColumns, setTableColumns] = useState(columns);
    const [visibleColumns, setVisibleColumns] = useState(persistedVisibility);

    const headerColumns = useMemo(() => {
        const storedColumnsOrder = localStorage.getItem(`${tableId}-columns-order`);
        const persistedColumnsOrder = storedColumnsOrder ? JSON.parse(storedColumnsOrder) : null;

        let newColumns = columns;

        if (persistedColumnsOrder) {
            newColumns = persistedColumnsOrder.map((columnId: string) => {
                return columns.find(col => col.id === columnId);
            });
        }

        if (visibleColumns) {
            newColumns = newColumns.map(col => {
                col.omit =
                    visibleColumns?.find((c: { id: string; omit: boolean }) => c.id === col.id)?.omit ?? col.omit;

                return col;
            });
        }

        return newColumns;
    }, [tableId, columns, visibleColumns]);

    const handlePaginationChange = (page: number) => {
        onPaginationChange(page);
    };

    return (
        <div className="flex flex-col gap-4 h-full">
            <div className="flex flex-col lg:flex-row gap-3">
                <div className="flex items-center w-full">
                    <div className="flex-grow">{upperSlot}</div>
                    {onRefresh && <RotateCw role="button" onClick={onRefresh} />}

                    <div className="">
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
                                    <Download className="text-default-500" />
                                </Button>
                            </CSVLink>
                        )}
                        <Dropdown>
                            <DropdownTrigger>
                                <Button variant="light" className="px-0" size="sm">
                                    <Columns className="text-default-500" />
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns.map((col: { id: string; omit: boolean }) =>
                                    !col.omit ? col.id : '',
                                )}
                                selectionMode="multiple"
                                onSelectionChange={keys => {
                                    const columnKeys = Array.from(keys);

                                    const columnsToPersist = tableColumns.map(col => {
                                        return {
                                            id: col.id,
                                            omit: !columnKeys.includes(col.id as string),
                                        };
                                    });

                                    localStorage.setItem(
                                        `${tableId}-columns-visibility`,
                                        JSON.stringify(columnsToPersist),
                                    );

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
            </div>
            <div className="flex-grow bg-white mt-1 rounded-3xl overflow-y-hidden h-full shadow-lg">
                <DataTable
                    data={data}
                    striped
                    expandableRows
                    expandableRowsComponent={expandableRowsComponent}
                    selectableRows
                    fixedHeader
                    fixedHeaderScrollHeight={upperSlot ? 'calc(100vh - 21rem)' : 'calc(100vh - 19rem)'}
                    persistTableHead
                    highlightOnHover
                    columns={headerColumns}
                    className="h-full"
                    progressPending={loading}
                    progressComponent={
                        <div className="p-48">
                            <Spinner size="lg" />
                        </div>
                    }
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
            {pagination && (
                <div>
                    <Pagination
                        rowsPerPage={rowsPerPage}
                        totalPages={Math.ceil(paginationTotalRows / rowsPerPage)}
                        currentPage={page}
                        onPageChange={handlePaginationChange}
                        totalEntries={paginationTotalRows}
                        onRowsPerPageChange={onRowsPerPageChange}
                        paginationPerPageOptions={paginationPerPageOptions}
                    />
                </div>
            )}
        </div>
    );
}

export default Table;
