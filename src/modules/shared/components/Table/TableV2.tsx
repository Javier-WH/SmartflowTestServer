import { useState, useEffect, useMemo, type ChangeEvent } from 'react';
import { RotateCw, Columns, Download } from 'react-feather';
import DataTable, { type SortOrder, type TableColumn } from 'react-data-table-component';
import Pagination from './Pagination';
import { CSVLink } from 'react-csv';
import {
    Button,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    Spinner,
    type Selection,
} from '@nextui-org/react';

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
    const [tableColumns, setTableColumns] = useState(columns);

    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(initialVisibleColumns));

    const headerColumns = useMemo(() => {
        if (visibleColumns === 'all') return tableColumns;

        return tableColumns.filter(column => Array.from(visibleColumns).includes(column.id as string));
    }, [visibleColumns, tableColumns]);

    useEffect(() => {
        if (tableId) {
            const storedColumns = localStorage.getItem(tableId);
            const persistedColumns = storedColumns ? JSON.parse(storedColumns) : null;
            let newColumns = columns;
            let newVisibleColumns = initialVisibleColumns;

            if (persistedColumns) {
                newColumns = persistedColumns.map((persistedColumn: TableColumn<any>) => {
                    const column = columns.find(column => column.id === persistedColumn.id);

                    if (persistedColumn.omit) {
                        newVisibleColumns = newVisibleColumns.filter(col => col !== column?.id);
                    }

                    if (column) {
                        return {
                            ...column,
                            ...persistedColumn,
                            sortable: column.sortable,
                            reorder: column.reorder,
                            sortField: column.sortField,
                            allowOverflow: column.allowOverflow,
                            center: column.center,
                            style: column.style,
                        };
                    }
                });
            }
            console.log('LS -> src/modules/shared/components/Table/TableV2.tsx:97 -> newColumns: ', newColumns);
            console.log(
                'LS -> src/modules/shared/components/Table/TableV2.tsx:100 -> newVisibleColumns: ',
                newVisibleColumns,
            );

            setVisibleColumns(new Set(newVisibleColumns));
            setTableColumns(newColumns);
        } else {
            setTableColumns(columns);
        }
    }, [tableId, columns, initialVisibleColumns]);

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
                            selectedKeys={visibleColumns || []}
                            selectionMode="multiple"
                            onSelectionChange={keys => {
                                setVisibleColumns(keys);
                                const columnKeys = Array.from(keys);

                                const columnsToPersist = tableColumns.map(col => {
                                    if (col.id) {
                                        if (columnKeys.includes(col.id)) {
                                            return {
                                                ...col,
                                                omit: false,
                                            };
                                        } else {
                                            return {
                                                ...col,
                                                omit: true,
                                            };
                                        }
                                    }

                                    return col;
                                });
                                localStorage.setItem(tableId ?? '', JSON.stringify(columnsToPersist));

                                setTableColumns(columnsToPersist);
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
                        localStorage.setItem(tableId ?? '', JSON.stringify(cols));
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
