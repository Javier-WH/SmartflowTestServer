import { Button, Divider, Input, Modal, ModalBody, ModalContent } from '@nextui-org/react';
import type { Product } from '../pages/inventory.data';
import { Fragment } from 'react/jsx-runtime';

export const MoveInventoryModal = ({
    product,
    isOpen,
    onOpenChange,
}: { product: Product; isOpen: boolean; onOpenChange: () => void }) => {
    return (
        <Modal isOpen={isOpen} onOpenChange={onOpenChange} size="lg">
            <ModalContent>
                <ModalBody>
                    <div className="grid grid-cols-2 gap-4">
                        <span>Nombre: </span>
                        <span>{product.name}</span>
                        <span>SKU: </span>
                        <span>{product.marketplace_product[0].marketplace_sku}</span>
                        <span>Precio: </span>
                        <span>{product.price}</span>
                        {product.business_product.map(bp => (
                            <Fragment key={bp.id}>
                                <span>Stock {bp.business_id.name}: </span>
                                <Input
                                    type="number"
                                    value={bp.stock}
                                    onChange={e => {
                                        console.log(
                                            '[LS] -> src/modules/inventory/components/MoveInventoryModal.tsx:18 -> e: ',
                                            e,
                                        );
                                    }}
                                    className="w-full"
                                />
                            </Fragment>
                        ))}
                    </div>

                    <Divider />

                    <div className="flex justify-end">
                        <Button color="primary" onClick={onOpenChange}>
                            Guardar
                        </Button>
                    </div>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
};
