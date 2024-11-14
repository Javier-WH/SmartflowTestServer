// @ts-nocheck
import { type ChangeEvent, useEffect, useMemo, useState } from 'react';

import {
    Button,
    type DateValue,
    Select,
    SelectItem,
    type RangeValue,
    DateRangePicker,
    Input,
    useDisclosure,
} from '@nextui-org/react';
import type { ExpanderComponentProps } from 'react-data-table-component/dist/DataTable/types';
import { IconX } from '@tabler/icons-react';
import { toast } from 'react-toastify';

import OrderProcessingModal from '../components/OrderProcessingModal';
import Table from '@/modules/shared/components/Table/Table';
import ActionsSelect from '../components/ActionsSelect';
import LoadingOverlay from '@/modules/shared/components/LoadingOverlay';

import { OrderAction, OrderStatus } from '../types/types';
import { type Order, orders_table_columns, orders_table_visible_columns } from './orders.data';

import { parseDate } from '@internationalized/date';
import { useLocation, useNavigate } from 'react-router-dom';
import useOrder from '../hooks/useOrder';
import useStatus from '../hooks/useStatus';
import { useDebouncedCallback } from 'use-debounce';
import { mapAcknowledgeableOrderList } from '../utils/mapper';
import MarketplaceSelector, { type Key } from '@/modules/shared/components/MarketplaceSelector';
import OrderService from '../services/order';

const ROWS_PER_PAGE = 100;

export default function Orders() {
    const location = useLocation();
    const navigate = useNavigate();

    const urlSearchParams = new URLSearchParams(location.search);
    const parsedPage = Number.parseInt(urlSearchParams.get('page') ?? '1');
    const parsedRowsPerPage = Number.parseInt(urlSearchParams.get('rowsPerPage') ?? `${ROWS_PER_PAGE}`);
    const parsedSelectedStatusId = urlSearchParams.get('status') ?? null;
    const parsedSelectedMarketplaceId = urlSearchParams.get('marketplace') ?? null;
    const parsedSelectedDateFrom = urlSearchParams.get('from') ?? null;
    const parsedSelectedDateTo = urlSearchParams.get('to') ?? null;
    const parsedSearchTerm = urlSearchParams.get('search') ?? '';

    const [selectedPage, setSelectedPage] = useState(parsedPage);
    const [rowsPerPage, setRowsPerPage] = useState(parsedRowsPerPage);
    const [selectedStatusId, setSelectedStatusId] = useState<string | number | null>(parsedSelectedStatusId);
    const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<Key | null | undefined>(
        parsedSelectedMarketplaceId,
    );
    const [searchTerm, setSearchTerm] = useState<string>(parsedSearchTerm);

    const dateValue =
        parsedSelectedDateFrom && parsedSelectedDateTo
            ? {
                  start: parseDate(parsedSelectedDateFrom) as unknown as DateValue,
                  end: parseDate(parsedSelectedDateTo) as unknown as DateValue,
              }
            : null;

    const [selectedDateRange, setSelectedDateRange] = useState<RangeValue<DateValue> | null>(dateValue);
    const [isDateRangePickerOpen, setIsDateRangePickerOpen] = useState(false);
    const [selectedRows, setSelectedRows] = useState<Order[]>([]);
    console.log('[LS] -> src/modules/orders/pages/Orders.tsx:67 -> selectedRows: ', selectedRows);

    const [selectedAction, setSelectedAction] = useState<OrderAction | null>(null);
    console.log('[LS] -> src/modules/orders/pages/Orders.tsx:69 -> selectedAction: ', selectedAction);
    const [selectedActionLoading, setSelectedActionLoading] = useState(false);
    const [ordersWithStockInfo, setOrdersWithStockInfo] = useState<Order[]>([]);

    const { isOpen, onOpenChange, onOpen } = useDisclosure();

    const {
        data: orders,
        totalRecords: ordersTotalRecords,
        isLoading: isOrdersLoading,
        mutate: updateOrders,
        acknowledgeOrders,
        downloadShippingLabels,
        changeOrderStatus,
    } = useOrder({
        page: selectedPage,
        rowsPerPage: rowsPerPage,
        status_id: selectedStatusId,
        marketplace_id: selectedMarketplaceId,
        from: selectedDateRange?.start?.toString(),
        to: selectedDateRange?.end?.toString(),
        search: searchTerm,
    });

    const { data: statusList, isLoading: isStatusLoading, error: statusError } = useStatus();

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
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedRowsPerPage !== rowsPerPage) {
            searchParams.set('rowsPerPage', `${rowsPerPage}`);
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedSelectedStatusId !== selectedStatusId) {
            if (selectedStatusId === null) {
                searchParams.delete('status');
            } else {
                searchParams.set('status', `${selectedStatusId}`);
            }
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedSelectedMarketplaceId !== selectedMarketplaceId) {
            if (selectedMarketplaceId == null) {
                searchParams.delete('marketplace');
            } else {
                searchParams.set('marketplace', `${selectedMarketplaceId}`);
            }
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedSelectedDateFrom !== selectedDateRange?.start?.toString()) {
            if (selectedDateRange?.start == null) {
                searchParams.delete('from');
            } else {
                searchParams.set('from', `${selectedDateRange?.start?.toString()}`);
            }
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedSelectedDateTo !== selectedDateRange?.end?.toString()) {
            if (selectedDateRange?.end == null) {
                searchParams.delete('to');
            } else {
                searchParams.set('to', `${selectedDateRange?.end?.toString()}`);
            }
            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }

        if (parsedSearchTerm !== searchTerm) {
            if (searchTerm === '') {
                searchParams.delete('search');
            } else {
                searchParams.set('search', `${searchTerm}`);
            }

            navigate({ pathname: location.pathname, search: searchParams.toString() });
        }
    }, [
        selectedPage,
        rowsPerPage,
        location.pathname,
        location.search,
        navigate,
        parsedPage,
        parsedRowsPerPage,
        parsedSelectedStatusId,
        parsedSelectedMarketplaceId,
        selectedStatusId,
        selectedMarketplaceId,
        selectedDateRange,
        parsedSelectedDateFrom,
        parsedSelectedDateTo,
        parsedSearchTerm,
        searchTerm,
    ]);

    const handleSearchTermChange = useDebouncedCallback((e: ChangeEvent<HTMLInputElement>) => {
        console.log('handleSearchTermChange', e.target.value);
        setSearchTerm(e.target.value);
    }, 500);

    const ExpandedRowComponent: React.FC<ExpanderComponentProps<Order>> = ({ data }) => {
        console.log('[LS] -> src/modules/orders/pages/Orders.tsx:191 -> data: ', data);
        const comission_amount = data.order_lines.reduce(
            (acc: number, orderLine: Order['order_lines'][0]) => acc + Number(orderLine.commission_amount),
            0,
        );

        let shipping_url = data.shipping_info?.shipping_tracking_url;

        const order_lines = data.order_lines.map(orderLine => ({
            sku: orderLine.sku,
            name: orderLine.productName,
            status: orderLine.status,
            upc: orderLine.upc,
            quantity: orderLine.shipment?.shipmentLines.reduce(
                (acc, shipmentLine) => acc + Number(shipmentLine.quantity.amount),
                0,
            ),
            tracking_number: orderLine.shipment?.trackingNumber,
        }));

        let action_onclick = null;
        let action_name = '';

        const update_current_order_in_table = () => {
            const new_orders = orders.map(order => {
                if (order.id === data.id) {
                    return {
                        ...order,
                        internal_status_id: statusList.find(s => s.id === order.internal_status_id.id + 1),
                    };
                }

                return order;
            });
            updateOrders(new_orders);
        };

        switch (data.internal_status_id.status) {
            case OrderStatus.ReadyToPackage:
                action_name = 'Marcar como empacado';
                action_onclick = async () => {
                    await changeOrderStatus(data.id, data.internal_status_id.id + 1);
                    update_current_order_in_table();
                };
                break;
            case OrderStatus.ReadyToShip:
                action_name = 'Marcar como enviado';
                action_onclick = async () => {
                    await changeOrderStatus(data.id, data.internal_status_id.id + 1);
                    update_current_order_in_table();
                };
                break;
            case OrderStatus.Shipped:
                action_name = 'Marcar como devolución';
                action_onclick = () => {
                    changeOrderStatus(data.id, data.internal_status_id.id + 1);
                    update_current_order_in_table();
                };
                break;
            default:
                break;
        }

        switch (data.marketplace_id.name) {
            case 'walmart':
                shipping_url = data.order_lines[0]?.shipment?.trackingURL;
        }

        return (
            <div className="w-full flex justify-between p-4 border-b-1 border-gray-200">
                <div className="flex flex-col gap-4">
                    {order_lines?.map(ol => (
                        <div key={ol.sku} className="flex gap-8 items-center">
                            <div className="flex gap-4 items-center">
                                <span className="text-sm">{ol.sku}</span>
                                <span className="text-sm">{ol.name}</span>
                                <span className="text-sm">{ol.quantity}</span>
                            </div>
                            <div className="flex gap-4 items-center">
                                <div>
                                    <span className="text-sm">Status: </span>
                                    <span className="text-sm">{ol.status}</span>
                                </div>
                                <div>
                                    <span className="text-sm">Tracking: </span>
                                    <span className="text-sm">{ol.tracking_number}</span>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
                <div className="flex gap-20 px-20">
                    <div className="flex flex-col gap-4">
                        <small className="flex gap-8 truncate max-w-[400px]">
                            <span>URL Shipping</span>
                            <a href={shipping_url} className="text-blue-600" target="_blank" rel="noreferrer">
                                {shipping_url}
                            </a>
                        </small>
                        <small className="flex gap-[4.5rem] truncate">
                            <span>Guia #</span>
                            <span>{data.shipping_info?.shipping_tracking}</span>
                        </small>
                    </div>
                    <div className="flex flex-col gap-4">
                        <small className="truncate">Comisiones ${comission_amount}</small>
                        {action_name ? (
                            <Button size="sm" radius="full" color="primary" onClick={action_onclick}>
                                {action_name}
                            </Button>
                        ) : null}
                    </div>
                </div>
            </div>
        );
    };

    async function handleAction() {
        switch (selectedAction) {
            case OrderAction.Accept: {
                setSelectedActionLoading(true);
                const ordersToBeacknowledge = mapAcknowledgeableOrderList(selectedRows);

                const [errors, response] = await acknowledgeOrders(ordersToBeacknowledge);
                setSelectedActionLoading(false);

                if (errors) {
                    if (Array.isArray(errors)) {
                        toast.dismiss();
                        for (const errMessage of errors) {
                            toast.error(errMessage, {
                                autoClose: false,
                                draggablePercent: 60,
                                draggable: true,
                            });
                        }
                    } else {
                        toast.error(errors);
                    }

                    return;
                }

                setOrdersWithStockInfo(response.orders as Order[]);

                onOpen();

                break;
            }
            case OrderAction.DownloadGuide: {
                setSelectedActionLoading(true);
                try {
                    const ordersToDownload = selectedRows.map(o => {
                        const tracking_number = o.order_lines[0]?.shipment?.trackingNumber;

                        return {
                            marketplace_id: o.marketplace_id.id,
                            tracking_number,
                        };
                    });

                    const [errors, response] = await downloadShippingLabels(ordersToDownload);

                    if (response) {
                        const url = window.URL.createObjectURL(response);
                        const a = document.createElement('a');
                        a.href = url;
                        a.download = 'shipping-labels.zip';
                        a.click();
                        toast.success('Guías de envio descargadas correctamente');
                    }
                } catch (error) {
                    console.error(error);
                } finally {
                    setSelectedActionLoading(false);
                }
                break;
            }
            case OrderAction.Reject:
                // TODO: mostrar el modal de rechazo
                break;
            case OrderAction.Scan:
                break;
            case OrderAction.ReadyToShip:
                // TODO: cambiar el status de las ordenes seleccionadas a "Preparado para despachar"
                break;
        }
    }

    return (
        <>
            {selectedActionLoading && <LoadingOverlay />}
            <Table
                tableId="orders-table-columns"
                data={orders}
                exportData={exportData}
                columns={orders_table_columns}
                loading={isOrdersLoading}
                pagination
                paginationTotalRows={ordersTotalRecords || 0}
                rowsPerPage={rowsPerPage}
                onRowsPerPageChange={setRowsPerPage}
                onPaginationChange={setSelectedPage}
                onSelectedRowsChange={setSelectedRows}
                page={selectedPage}
                sortServer
                exportToCsv
                bottomSlot={
                    <div className="flex w-full gap-3">
                        <div>
                            <ActionsSelect
                                onChange={setSelectedAction}
                                buttonDisabled={!selectedRows?.length || !selectedAction}
                                onButtonClick={handleAction}
                            />
                        </div>
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
                        <DateRangePicker
                            startContent={
                                selectedDateRange != null ? (
                                    <div role="button" className="absolute bottom-[3px] right-9">
                                        <IconX
                                            className="text-default-400"
                                            onClick={() => {
                                                setSelectedDateRange(null);
                                                setIsDateRangePickerOpen(false);
                                            }}
                                        />
                                    </div>
                                ) : null
                            }
                            value={selectedDateRange}
                            className="max-w-60 w-full"
                            onChange={setSelectedDateRange}
                            radius="full"
                            size="sm"
                            label="FECHA"
                            labelPlacement="inside"
                            isOpen={isDateRangePickerOpen}
                            onOpenChange={setIsDateRangePickerOpen}
                            shouldForceLeadingZeros
                            classNames={{ inputWrapper: 'shadow-lg bg-white' }}
                            CalendarBottomContent={
                                <div className="flex justify-center py-4">
                                    <Button
                                        size="sm"
                                        radius="full"
                                        color="primary"
                                        className="px-6"
                                        onClick={() => {
                                            setSelectedDateRange(null);
                                            setIsDateRangePickerOpen(false);
                                        }}
                                    >
                                        Reset
                                    </Button>
                                </div>
                            }
                        />
                        <Select
                            className="w-40 m-0"
                            classNames={{ trigger: 'shadow-lg bg-white' }}
                            label="STATUS"
                            size="sm"
                            radius="full"
                            isLoading={isStatusLoading}
                            selectionMode="single"
                            items={statusList}
                            isInvalid={statusError != null}
                            onSelectionChange={keys => {
                                const statusId = Array.from(keys)[0] as number;

                                setSelectedStatusId(statusId ?? null);
                            }}
                            selectedKeys={selectedStatusId ? [selectedStatusId] : []}
                        >
                            {item => (
                                <SelectItem key={item.id} className="capitalize">
                                    {item.name}
                                </SelectItem>
                            )}
                        </Select>
                        <MarketplaceSelector
                            selectedKeys={selectedMarketplaceId != null ? [selectedMarketplaceId] : []}
                            onSelect={setSelectedMarketplaceId}
                        />
                    </div>
                }
                initialVisibleColumns={orders_table_visible_columns}
                expandableRowsComponent={ExpandedRowComponent}
            />
            {isOpen && <OrderProcessingModal data={ordersWithStockInfo} isOpen={isOpen} onOpenChange={onOpenChange} />}
        </>
    );
}
