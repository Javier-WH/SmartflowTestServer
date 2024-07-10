import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';

export default function NewProduct({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
            <ModalContent>
                <ModalHeader>Nuevo Producto</ModalHeader>
                <form>
                    <ModalBody>
                        <Input label="Nombre" autoFocus />

                        <div className="flex gap-4">
                            <Input label="SKU" readOnly />
                            <Input label="Marca" />
                        </div>
                        <div className="flex gap-4">
                            <Input type="number" label="Precio" />
                            <Input label="EAN" />
                        </div>
                        <Divider />

                        <div className="flex justify-end">
                            <Button type="submit" color="primary" className="px-8">
                                Crear
                            </Button>
                        </div>
                    </ModalBody>
                </form>
            </ModalContent>
        </Modal>
    );
}
