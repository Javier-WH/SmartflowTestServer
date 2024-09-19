import { useMemo, useRef } from 'react';

import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@nextui-org/react';

import Table from '@/modules/shared/components/Table/Table';
import { type Order, orders_table_columns } from '../pages/orders.data';
import { CSVLink } from 'react-csv';

export default function OrderProcessingModal({
    data,
    isOpen,
    onOpenChange,
}: { data: Array<Order>; isOpen: boolean; onOpenChange: () => void }) {
    const csvDownloadLinkRef = useRef(null);

    const csvData = useMemo(() => {
        const skus = {};

        data.forEach(order => {
            order.order_lines.forEach(order_line => {
                let quantity = Number(order_line.shipment.shipmentLines[0].quantity.amount);

                skus[order_line.sku] = {
                    name: order_line.productName,
                    quantity: (skus[order_line.sku]?.quantity ?? 0) + quantity,
                };
            });
        });

        return Object.keys(skus).map(sku => ({
            sku,
            name: skus[sku].name,
            quantity: skus[sku].quantity,
        }));
    }, [data]);

    async function handlePurchaseReport() {
        // TODO: call server to change status of orders to "Pedido ejecutado"
        setTimeout(() => {
            csvDownloadLinkRef.current.link.click();
        }, 2000);
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} className="max-w-[1200px] max-h-[80vh] h-[max-content]">
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Procesando pedidos</ModalHeader>
                        <ModalBody>
                            <div className="flex flex-row gap-4">
                                <div className="max-w-[49%] border-r-2 pr-4">
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
                                            data={data}
                                            columns={orders_table_columns}
                                            pagination={false}
                                            showColumnsSelector={false}
                                            className="max-h-[600px]"
                                            headerScrollHeight="calc(100vh - 24rem)"
                                        />
                                    </div>
                                    <span className="text-small">{data.length} órdenes</span>
                                </div>

                                <div className="max-w-[49%]">
                                    <div className="flex justify-end">
                                        <span className="text-success-500">Listo para empacar</span>
                                    </div>
                                    <div className="mt-4 mb-2">
                                        <Table
                                            tableId=""
                                            data={data}
                                            columns={orders_table_columns}
                                            pagination={false}
                                            showColumnsSelector={false}
                                            className="max-h-[600px]"
                                            headerScrollHeight="calc(100vh - 24rem)"
                                        />
                                    </div>
                                    <span className="text-small">{data.length} órdenes</span>
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
