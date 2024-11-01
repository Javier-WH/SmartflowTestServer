import { useEffect, useState } from 'react';
import type { FormEvent } from 'react';

import {
    Button,
    Divider,
    Input,
    Modal,
    ModalBody,
    ModalContent,
    ModalHeader,
    Select,
    SelectItem,
} from '@nextui-org/react';

import SKUSelector from '@/modules/shared/components/SKUSelector';
import useBusiness from '../hooks/useBusiness';
import type { Product, SupplyProduct as SupplyProductType } from './inventory.data';
import Table from '@/modules/shared/components/Table/Table';
import type { TableColumn } from 'react-data-table-component';
import { Trash } from 'react-feather';

export default function SupplyProduct({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data: businesses, isLoading: businessesLoading, error: businessesError } = useBusiness();

    const [selectedBusinessId, setSelectedBusinessId] = useState<{ name: string; id: number }>();
    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [quantity, setQuantity] = useState<number>(1);

    const [productsPreview, setProductsPreview] = useState<SupplyProductType[]>([]);

    const supply_products_table_columns: TableColumn<SupplyProductType>[] = [
        {
            id: 'marketplace_sku',
            name: 'SKU',
            selector: row => row.marketplace_product?.[0]?.marketplace_sku ?? '', // WARNING: This must be correctly handled as a list of skus, one per marketplace
            maxWidth: 'max-content',
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'name',
            name: 'Nombre',
            selector: row => row.name,
            maxWidth: '250px',
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'business',
            name: 'Empresa',
            selector: row => row.business?.name ?? '',
            maxWidth: 'max-content',
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'quantity',
            name: 'Cantidad',
            selector: row => row.quantity,
            maxWidth: '50px',
            sortable: false,
            reorder: true,
            omit: false,
        },
        {
            id: 'actions',
            name: 'Actions',
            selector: row => row.id,
            format: row => (
                <Button
                    color="danger"
                    className="p-0"
                    variant="light"
                    onClick={() => setProductsPreview(productsPreview.filter(product => product.id !== row.id))}
                >
                    <Trash size={15} />
                </Button>
            ),
            sortable: false,
            reorder: true,
            omit: false,
        },
    ];

    async function handleSubmit(e: FormEvent<HTMLFormElement>) {
        e.preventDefault();

        if (selectedProduct && selectedBusinessId && quantity) {
            let existing = false;
            for (const product of productsPreview) {
                if (product.id === selectedProduct.id && product.business.id === selectedBusinessId.id) {
                    existing = true;
                    product.quantity += quantity;
                    break;
                }
            }

            if (!existing) {
                setProductsPreview([
                    { ...selectedProduct, business: selectedBusinessId, quantity },
                    ...productsPreview,
                ]);
            }

            setSelectedProduct(undefined);
            setQuantity(1);
        }
    }

    useEffect(() => {
        if (businesses?.length) {
            setSelectedBusinessId({ name: businesses[0].name, id: businesses[0].id });
        }
    }, [businesses]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
            <ModalContent>
                <ModalHeader>Abastecer SKU</ModalHeader>

                <form onSubmit={handleSubmit}>
                    <ModalBody>
                        <div className="flex flex-col md:flex-row gap-4 md:p-6 w-full items-center">
                            <div className="flex flex-col gap-4 md:max-w-[50%] md:w-[30%]">
                                <div className="flex gap-4">
                                    <SKUSelector value={selectedProduct} onChange={setSelectedProduct} />
                                </div>
                                <div className="flex items-end gap-4">
                                    <Select
                                        label="Empresa"
                                        size="sm"
                                        isLoading={businessesLoading}
                                        selectionMode="single"
                                        items={businesses ?? []}
                                        isInvalid={businessesError != null}
                                        onSelectionChange={keys => {
                                            const businessId = Array.from(keys)[0] as number;

                                            const business = businesses?.find(business => business.id === businessId);

                                            setSelectedBusinessId({ name: business?.name ?? '', id: businessId });
                                        }}
                                        selectedKeys={selectedBusinessId ? [selectedBusinessId.id] : []}
                                        classNames={{ base: 'h-full', trigger: 'h-full', mainWrapper: 'h-full' }}
                                    >
                                        {item => (
                                            <SelectItem key={item.id} className="capitalize">
                                                {item.name}
                                            </SelectItem>
                                        )}
                                    </Select>
                                    <Input
                                        name="quantity"
                                        type="number"
                                        label="Cantidad"
                                        onChange={e => setQuantity(Number(e.target.value))}
                                        value={quantity?.toString() ?? ''}
                                    />
                                </div>

                                <Button type="submit" color="primary" className="w-48 self-center">
                                    Enviar
                                </Button>
                            </div>

                            <Divider orientation="vertical" />

                            <div className="flex flex-col gap-4 items-end w-full md:w-[70%] ">
                                <div className="w-full max-h-[300px] overflow-auto border-b-zinc-300 border-b-1">
                                    <Table
                                        tableId="supply-product-table"
                                        data={productsPreview}
                                        columns={supply_products_table_columns}
                                        pagination={false}
                                    />
                                </div>
                                <Button color="primary" className="w-36">
                                    Guardar
                                </Button>
                            </div>
                        </div>
                    </ModalBody>
                </form>
            </ModalContent>
        </Modal>
    );
}
