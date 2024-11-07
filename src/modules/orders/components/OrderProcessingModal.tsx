// @ts-nocheck
import { useMemo, useRef } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';
import { CSVLink } from 'react-csv';
import type { TableColumn } from 'react-data-table-component';

import Table from '@/modules/shared/components/Table/Table';
import { type Order, orders_table_columns } from '../pages/orders.data';

export default function OrderProcessingModal({
    data,
    isOpen,
    onOpenChange,
}: { data: Array<Order>; isOpen: boolean; onOpenChange: () => void }) {
    const csvDownloadLinkRef = useRef(null);

    const [ordersWithoutStock, ordersWithStock] = useMemo(() => {
        const ordersWithoutStock: Order[] = [];
        const ordersWithStock: Order[] = [];

        for (const order of data) {
            if (order.has_stock) {
                ordersWithStock.push(order);
            } else {
                ordersWithoutStock.push(order);
            }
        }

        return [ordersWithoutStock, ordersWithStock];
    }, [data]);

    const csvData = useMemo(() => {
        if (!ordersWithoutStock?.length) return [];

        const skus = {};

        for (const order of ordersWithoutStock) {
            for (const order_line of order.order_lines) {
                const quantity = Number(order_line.shipment.shipmentLines[0].quantity.amount);

                skus[order_line.sku] = {
                    name: order_line.productName,
                    quantity: (skus[order_line.sku]?.quantity ?? 0) + quantity,
                };
            }
        }

        return Object.keys(skus).map(sku => ({
            sku,
            name: skus[sku].name,
            quantity: skus[sku].quantity,
        }));
    }, [ordersWithoutStock]);

    async function handlePurchaseReport() {
        // TODO: call server to change status of orders to "Pedido ejecutado"
        setTimeout(() => {
            csvDownloadLinkRef.current?.link.click();
        }, 2000);
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="max-w-[1200px] max-h-[80vh] h-[max-content]">
            <ModalContent>
                {() => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Procesando pedidos</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-col md:flex-row gap-4">
                                <div className="md:max-w-[49%] border-r-2 pr-4">
                                    <div className="flex justify-between">
                                        <Button color="primary" size="sm" onClick={handlePurchaseReport}>
                                            Reporte de compra
                                        </Button>

                                        <CSVLink
                                            ref={csvDownloadLinkRef}
                                            data={csvData}
                                            filename={`reporte-de-compra-${new Date().toISOString()}.csv`}
                                            target="_blank"
                                        />
                                        <span className="text-red-500">Inventario incompleto</span>
                                    </div>
                                    <div className="mb-2">
                                        <Table
                                            tableId=""
                                            data={ordersWithoutStock ?? []}
                                            columns={orders_table_columns}
                                            pagination={false}
                                            showColumnsSelector={false}
                                            className="max-h-[600px]"
                                            headerScrollHeight="calc(100vh - 24rem)"
                                            selectableRows={false}
                                        />
                                    </div>
                                    <span className="text-small">{ordersWithoutStock?.length ?? 0} órdenes</span>
                                </div>

                                <div className="md:max-w-[49%]">
                                    <div className="flex justify-end">
                                        <span className="text-success-500">Listo para empacar</span>
                                    </div>
                                    <div className="mt-4 mb-2">
                                        <Table
                                            tableId=""
                                            data={ordersWithStock ?? []}
                                            columns={orders_table_columns}
                                            pagination={false}
                                            showColumnsSelector={false}
                                            className="max-h-[600px]"
                                            headerScrollHeight="calc(100vh - 24rem)"
                                            selectableRows={false}
                                        />
                                    </div>
                                    <span className="text-small">{ordersWithStock?.length ?? 0} órdenes</span>
                                </div>
                            </div>
                        </ModalBody>
                        <ModalFooter />
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}

export const table_columns: TableColumn<Order>[] = [
    {
        id: 'id',
        name: 'ID',
        selector: row => row.id,
    },
    {
        id: 'order_id',
        name: '# PEDIDO',
        selector: row => row.order_id,
    },
    {
        id: 'created_at',
        name: 'FECHA',
        selector: row => row.created_at,
        format: row => (
            <span className="capitalize" title={row.created_at}>
                {Intl.DateTimeFormat('es-MX', { dateStyle: 'medium', timeStyle: 'short' }).format(
                    new Date(row.created_at),
                )}
            </span>
        ),
    },
    {
        id: 'marketplace_id.name',
        name: 'MARKETPLACE',
        selector: row => row.marketplace_id?.name,
        format: row => <span className="capitalize">{row.marketplace_id?.name}</span>,
    },
    // {
    //     id: 'marketplace_status',
    //     name: 'MARKETPLACE STATUS',
    //     selector: row => row.marketplace_status,
    // },
    {
        id: 'internal_internal_status_id.name',
        name: 'INTERNAL STATUS',
        selector: row => row.internal_status_id.status,
    },
    {
        id: 'total',
        name: 'TOTAL',
        selector: row => row.total,
        format: row => <span>${row.total}</span>,
    },
];
