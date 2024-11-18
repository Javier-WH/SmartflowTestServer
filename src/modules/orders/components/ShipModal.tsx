import { type FormEvent, useState } from 'react';

import AlertMessage from '@/modules/auth/components/ErrorMessage';
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Spinner } from '@nextui-org/react';
import Table from '@/modules/shared/components/Table/Table';
import type { TableColumn } from 'react-data-table-component';
import type { Order } from '../pages/orders.data';
import { ChevronRight, Trash } from 'react-feather';

export default function ShipModal({
    orders,
    isOpen,
    onOpenChange,
}: { orders: Order[]; isOpen: boolean; onOpenChange: () => void }) {
    const [ordersToShip, setOrdersToShip] = useState<Order[]>(orders);
    const [ordersPreview, setOrdersPreview] = useState<Order[]>([]);
    const [scanSearchLoading, setScanSearchLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();
    const [selectedRow, setSelectedRow] = useState<Order | null>(null);
    const [clearSelectedRows, setClearSelectedRows] = useState(false);

    const orders_to_ship_table_columns: TableColumn<Order>[] = [
        {
            id: 'order_id',
            name: '# PEDIDO',
            selector: row => row.order_id,
        },
        {
            id: 'marketplace',
            name: 'MARKETPLACE',
            selector: row => row.marketplace_id.name,
        },
        {
            id: 'total',
            name: 'TOTAL',
            selector: row => `$${row.total}`,
        },
    ];

    async function handlePassToPreview() {
        if (!selectedRow) return;

        setOrdersToShip(old => old.filter(order => order.order_id !== selectedRow?.order_id));
        setOrdersPreview(old => [...old, selectedRow]);
        setSelectedRow(null);
        setClearSelectedRows(!clearSelectedRows);
    }

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
                            <span>Órdenes para enviar</span>
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
                                    <span>Previsualización</span>
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
                                onClick={() => {
                                    console.log('save');
                                }}
                                isLoading={isLoading}
                                isDisabled={isLoading}
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
