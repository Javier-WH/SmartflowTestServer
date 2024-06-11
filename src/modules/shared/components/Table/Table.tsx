import { useState, useMemo, useCallback, type ChangeEvent, type Key } from 'react';
import {
    Table as TableComponent,
    TableHeader,
    TableColumn as TableColumnComponent,
    TableBody,
    TableRow,
    TableCell,
    Input,
    Button,
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Pagination,
    type Selection,
    type SortDescriptor,
    Spinner,
} from '@nextui-org/react';
import { IconChevronDown, IconSearch } from '@tabler/icons-react';
import { capitalize } from './utils';
import type { TableColumn } from '../../types/table';

export default function Table({
    data,
    columns,
    initialVisibleColumns,
    renderCell,
    onSearch,
    filterElement,
    sortDescriptor: sortDescriptorProp,
    rowsPerPage: rowsPerPageProp,
    totalRecords,
    page,
    onPageChange,
    isLoading,
    error,
}: {
    data: any[];
    columns: TableColumn<any>[];
    initialVisibleColumns: string[];
    renderCell: (item: any, columnKey: Key) => React.ReactElement;
    onSearch?: (value?: string) => any[];
    filterElement?: React.ReactElement;
    sortDescriptor?: SortDescriptor;
    rowsPerPage?: number;
    page?: number;
    onPageChange?: (page: number) => void;
    totalRecords?: number | null;
    isLoading?: boolean;
    error?: string;
}) {
    const [filterValue, setFilterValue] = useState('');
    const [selectedKeys, setSelectedKeys] = useState<Selection>(new Set([]));
    const [visibleColumns, setVisibleColumns] = useState<Selection>(new Set(initialVisibleColumns));
    const [rowsPerPage, setRowsPerPage] = useState(rowsPerPageProp || 500);
    const [sortDescriptor, setSortDescriptor] = useState<SortDescriptor | undefined>(sortDescriptorProp);

    const headerColumns = useMemo(() => {
        if (visibleColumns === 'all') return columns;

        return columns.filter(column => Array.from(visibleColumns).includes(column.uid));
    }, [visibleColumns, columns]);

    const sortedItems = useMemo(() => {
        return [...data].sort((a, b) => {
            const first = a[sortDescriptor?.column as keyof typeof data] as number;
            const second = b[sortDescriptor?.column as keyof typeof data] as number;
            const cmp = first < second ? -1 : first > second ? 1 : 0;

            return sortDescriptor?.direction === 'descending' ? -cmp : cmp;
        });
    }, [sortDescriptor, data]);

    const onRowsPerPageChange = useCallback((e: ChangeEvent<HTMLSelectElement>) => {
        setRowsPerPage(Number(e.target.value));
    }, []);

    const onSearchChange = useCallback((value?: string) => {
        if (value) {
            setFilterValue(value);
        } else {
            setFilterValue('');
        }
    }, []);

    const onClear = useCallback(() => {
        setFilterValue('');
    }, []);

    const topContent = useMemo(() => {
        return (
            <div className="flex flex-col gap-4">
                <div className="flex justify-between gap-3 items-end">
                    {onSearch ? (
                        <Input
                            isClearable
                            className="w-full sm:max-w-[44%]"
                            placeholder="Search..."
                            startContent={<IconSearch />}
                            value={filterValue}
                            onClear={() => onClear()}
                            onValueChange={onSearchChange}
                            classNames={{
                                input: 'bg-white hover:bg-white',
                                inputWrapper:
                                    'bg-white data-[hover=true]:bg-white data-[focus=true]:bg-white group-data-[focus=true]:bg-white',
                            }}
                        />
                    ) : (
                        <div className="flex-grow" />
                    )}
                    <div className="flex gap-3 items-center">
                        {filterElement ? filterElement : null}

                        <Dropdown>
                            <DropdownTrigger className="hidden sm:flex">
                                <Button endContent={<IconChevronDown className="text-small" />} variant="flat">
                                    Columns
                                </Button>
                            </DropdownTrigger>
                            <DropdownMenu
                                disallowEmptySelection
                                aria-label="Table Columns"
                                closeOnSelect={false}
                                selectedKeys={visibleColumns || []}
                                selectionMode="multiple"
                                onSelectionChange={setVisibleColumns}
                            >
                                {columns.map(column => (
                                    <DropdownItem key={column.uid} className="capitalize">
                                        {capitalize(column.title)}
                                    </DropdownItem>
                                ))}
                            </DropdownMenu>
                        </Dropdown>
                    </div>
                </div>
                <div className="flex justify-between items-center">
                    {/* <span className="text-default-400 text-small">Total {users.length} users</span> */}
                    <label className="flex items-center text-default-400 text-small">
                        Rows per page:
                        <select
                            className="bg-transparent outline-none text-default-400 text-small"
                            onChange={onRowsPerPageChange}
                            defaultValue={rowsPerPage}
                        >
                            <option value="50">50</option>
                            <option value="100">100</option>
                            <option value="500">500</option>
                        </select>
                    </label>
                </div>
            </div>
        );
    }, [
        filterValue,
        visibleColumns,
        onSearchChange,
        onRowsPerPageChange,
        onClear,
        onSearch,
        filterElement,
        columns,
        rowsPerPage,
    ]);

    const bottomContent = useMemo(() => {
        const pages = Math.ceil((totalRecords || data.length) / rowsPerPage);

        return (
            <div className="py-2 px-2 flex justify-between items-center">
                <span className="w-[30%] text-small text-default-400">
                    {selectedKeys === 'all' ? 'All items selected' : `${selectedKeys.size} of ${data.length} selected`}
                </span>
                <Pagination
                    isCompact
                    showShadow
                    color="primary"
                    page={page}
                    initialPage={page}
                    total={pages}
                    onChange={onPageChange}
                />
            </div>
        );
    }, [selectedKeys, page, data.length, totalRecords, rowsPerPage, onPageChange]);

    return (
        <TableComponent
            isStriped
            aria-label="Example table with custom cells, pagination and sorting"
            isHeaderSticky
            bottomContent={bottomContent}
            bottomContentPlacement="outside"
            classNames={{
                base: 'h-full',
                wrapper: 'p-0 max-h-[calc(100vh_-_25rem)]',
                th: 'bg-white',
            }}
            selectedKeys={selectedKeys}
            selectionMode="multiple"
            sortDescriptor={sortDescriptor}
            topContent={topContent}
            topContentPlacement="outside"
            onSelectionChange={setSelectedKeys}
            onSortChange={setSortDescriptor}
        >
            <TableHeader columns={headerColumns}>
                {column => (
                    <TableColumnComponent
                        key={column.uid}
                        align={column.uid === 'actions' ? 'center' : 'start'}
                        allowsSorting={column.sortable}
                    >
                        {column.title}
                    </TableColumnComponent>
                )}
            </TableHeader>
            <TableBody
                emptyContent="No items found"
                items={sortedItems}
                isLoading={isLoading}
                loadingContent={<Spinner size="lg" />}
            >
                {item => (
                    <TableRow key={item.id}>
                        {columnKey => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                    </TableRow>
                )}
            </TableBody>
        </TableComponent>
    );
}
