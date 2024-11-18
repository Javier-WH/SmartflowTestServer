import { useState } from 'react';
import { Button, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import { toast } from 'react-toastify';

import type { Order } from '@/modules/orders/pages/orders.data';

import useProduct from '@/modules/inventory/hooks/useProduct';
import useOrder from '@/modules/orders/hooks/useOrder';

export default function ReturnModal({
    order,
    isOpen,
    onOpenChange,
}: { order: Order; isOpen: boolean; onOpenChange: () => void }) {
    const { sumInventory } = useProduct({});
    const { changeOrderStatus, mutate: updateOrders } = useOrder();

    const [loading, setLoading] = useState(false);

    async function onSaveInventory() {
        if (!order) return;
        try {
            setLoading(true);
            const sku_list = order.order_lines?.map(ol => ({
                sku: ol.sku,
                quantity: ol.shipment?.shipmentLines?.reduce((acc, sl) => acc + Number(sl.quantity.amount), 0) ?? 0,
                business_id: 1, // TODO: get business id from user input
            }));

            if (!sku_list?.length) return;

            const response = await sumInventory({ sku_list });

            if (response?.error) {
                const error = await response?.error?.context?.json();
                return toast.error(error?.error);
            }

            await changeOrderStatus(order.id, order.internal_status_id.id + 1);
            await updateOrders();

            toast.success('Los productos fueron agregados al inventario');
            onOpenChange();
        } catch (error: any) {
            toast.error(error?.message);
        } finally {
            setLoading(false);
        }
    }

    async function onDiscard() {
        if (!order) return;
        try {
            setLoading(true);
            await changeOrderStatus(order.id, order.internal_status_id.id + 1);
            await updateOrders();

            toast.success('La orden fue marcada como devuelta');
            onOpenChange();
        } catch (error: any) {
            toast.error(error?.message);
        } finally {
            setLoading(false);
        }
    }

    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="md">
            <ModalContent>
                <ModalHeader>Devolución</ModalHeader>

                <ModalBody className="p-8">
                    <h1 className="text-center mb-8 font-bold">¿Qué desea hacer?</h1>

                    <div className="flex justify-between">
                        <Button
                            color="primary"
                            onClick={onSaveInventory}
                            isLoading={loading}
                            isDisabled={!order || loading}
                        >
                            Volver a inventario
                        </Button>
                        <Button color="warning" onClick={onDiscard} isLoading={loading} isDisabled={!order || loading}>
                            Desechar
                        </Button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
