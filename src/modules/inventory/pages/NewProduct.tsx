import { useState, useEffect, type FormEvent } from 'react';

import { Button, Divider, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@nextui-org/react';
import useProduct from '../hooks/useProduct';
import MarketplaceSelector, { type Key } from '@/modules/shared/components/MarketplaceSelector';

export default function NewProduct({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { generateSKU } = useProduct();

    const [sku, setSKU] = useState('');
    const [selectedMarketplaceId, setSelectedMarketplaceId] = useState<Key | null | undefined>(null);

    function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        const marketplace_sku = e.currentTarget['marketplace-sku'].value;
        const name = e.currentTarget['product-name'].value;
        const brand = e.currentTarget.brand.value;
        const price = e.currentTarget.price.value;
        const ean = e.currentTarget.ean.value;

        console.log({ selectedMarketplaceId, sku, marketplace_sku, name, brand, price, ean });
    }

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
        const sku = generateSKU();
        setSKU(sku);
    }, []);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="lg">
            <ModalContent>
                <ModalHeader>Nuevo Producto</ModalHeader>
                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="flex gap-4">
                            <MarketplaceSelector
                                selectedKeys={selectedMarketplaceId != null ? [selectedMarketplaceId] : []}
                                onSelect={setSelectedMarketplaceId}
                                className="w-80"
                            />

                            <Input name="marketplace-sku" label="Marketplace SKU" autoFocus />
                        </div>

                        <Input name="product-name" label="Nombre" />

                        <div className="flex gap-4">
                            <Input readOnly label="SKU" value={sku} />
                            <Input name="brand" label="Marca" />
                        </div>
                        <div className="flex gap-4">
                            <Input name="price" type="number" label="Precio" />
                            <Input name="ean" label="EAN" />
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
