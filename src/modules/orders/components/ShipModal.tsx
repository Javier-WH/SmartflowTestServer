import { useState, useEffect } from 'react';

import { Modal, ModalContent, ModalHeader, ModalBody, Button, Spinner } from '@nextui-org/react';
import type { TableColumn } from 'react-data-table-component';
import { ChevronRight, Trash } from 'react-feather';

import AlertMessage from '@/modules/auth/components/ErrorMessage';
import Table from '@/modules/shared/components/Table/Table';
import type { Order } from '../pages/orders.data';
import type { InventorySkuChange } from '@/modules/inventory/services/product';

import useProduct from '@/modules/inventory/hooks/useProduct';
import { toast } from 'react-toastify';
import useOrder from '../hooks/useOrder';

export default function ShipModal({
    orders,
    isOpen,
    onOpenChange,
    onClose,
}: { orders: Order[]; isOpen: boolean; onOpenChange: () => void; onClose: () => void }) {
    const [ordersToShip, setOrdersToShip] = useState<Order[]>(orders);
    const [ordersPreview, setOrdersPreview] = useState<Order[]>([]);
    const [scanSearchLoading, setScanSearchLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [selectedRow, setSelectedRow] = useState<Order | null>(null);
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const { substractInventory } = useProduct({});
    const { changeOrderStatusInBulk } = useOrder();

    const orders_to_ship_table_columns: TableColumn<Order>[] = [
        {
            id: 'order_id',
            name: '# PEDIDO',
            selector: row => row.order_id,
            width: 'auto',
        },
        {
            id: 'marketplace',
            name: 'MARKETPLACE',
            selector: row => row.marketplace_id.name,
            width: 'auto',
        },
        {
            id: 'total',
            name: 'TOTAL',
            selector: row => `$${row.total}`,
            width: 'auto',
        },
    ];

    async function handlePassToPreview() {
        if (!selectedRow) return;

        setOrdersToShip(old => old.filter(order => order.order_id !== selectedRow?.order_id));
        setOrdersPreview(old => [...old, selectedRow]);
        setSelectedRow(null);
        setClearSelectedRows(!clearSelectedRows);
    }

    // WARNING: This logic must be handled in a transaction
    async function handleSave() {
        if (!ordersPreview?.length) return;
        try {
            setIsLoading(true);

            const sku_list: InventorySkuChange[] = [];

            for (const order of ordersPreview) {
                const orderLines = order.order_lines;

                if (orderLines?.length) {
                    for (const orderLine of orderLines) {
                        const sku = orderLine.sku;
                        const quantity =
                            orderLine.shipment?.shipmentLines.reduce(
                                (acc, shipmentLine) => acc + Number(shipmentLine.quantity.amount),
                                0,
                            ) ?? 0;

                        sku_list.push({ sku, quantity });
                    }
                }
            }

            const response = await substractInventory({ sku_list });

            if (response?.error) {
                const error = await response?.error?.context?.json();
                toast.error(error?.error);
                return;
            }

            await changeOrderStatusInBulk(
                ordersPreview.map(order => ({ order_id: order.id, status_id: order.internal_status_id.id + 1 })),
            );

            toast.success('Ordenes enviadas correctamente');
            onOpenChange();
            onClose();
        } catch (error: any) {
            alert(error?.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        async function onScan(props) {
            try {
                setScanSearchLoading(true);
            } catch (error: any) {
                alert(error?.message);
            } finally {
                setScanSearchLoading(false);
            }
        }

        document.addEventListener('scan', onScan);

        return () => {
            document.removeEventListener('scan', onScan);
        };
    }, []);

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="5xl">
            <ModalContent className="relative">
                {scanSearchLoading && (
                    <div className="absolute flex justify-center w-full h-full bg-zinc-300 bg-opacity-70 z-50">
                        <Spinner color="primary" size="lg" />
                    </div>
                )}
                <ModalHeader>Abastecer SKU</ModalHeader>

                <ModalBody>
                    <div className="flex flex-col md:flex-row gap-4 md:p-6 w-full items-center">
                        <div className="w-full">
                            <div className="flex gap-2 items-center">
                                <span>Órdenes para enviar</span>
                                <small>{ordersToShip.length}</small>
                            </div>
                            <Table
                                tableId="orders-to-ship-table"
                                data={ordersToShip}
                                columns={orders_to_ship_table_columns}
                                pagination={false}
                                showColumnsSelector={false}
                                selectableRowsSingle
                                onSelectedRowsChange={rows => setSelectedRow(rows[0])}
                                clearSelectedRows={clearSelectedRows}
                            />
                        </div>

                        <Button color="primary" size="sm" onClick={handlePassToPreview} isDisabled={!selectedRow}>
                            <ChevronRight size={15} />
                        </Button>

                        <div className="flex flex-col gap-4 items-end w-full">
                            <div className="w-full max-h-[300px] overflow-auto border-b-zinc-300 border-b-1">
                                <div className="flex justify-between items-center">
                                    <div className="flex gap-2 items-center">
                                        <span>Previsualización</span>
                                        <small>{ordersPreview.length}</small>
                                    </div>
                                    <Button
                                        color="primary"
                                        size="sm"
                                        onClick={() => {
                                            setOrdersToShip(orders);
                                            setOrdersPreview([]);
                                        }}
                                    >
                                        <Trash />
                                    </Button>
                                </div>
                                <Table
                                    tableId="supply-product-table"
                                    data={ordersPreview}
                                    columns={orders_to_ship_table_columns}
                                    pagination={false}
                                    showColumnsSelector={false}
                                />
                            </div>

                            {error && (
                                <div className="flex justify-center w-full">
                                    <AlertMessage text={error} type="error" />
                                </div>
                            )}
                            <Button
                                color="primary"
                                className="w-36"
                                onClick={handleSave}
                                isLoading={isLoading}
                                isDisabled={isLoading || !ordersPreview?.length}
                            >
                                Guardar
                            </Button>
                        </div>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
