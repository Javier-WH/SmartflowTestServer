import { useCallback, useEffect, useState } from 'react';
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
    Spinner,
} from '@nextui-org/react';
import type { TableColumn } from 'react-data-table-component';
import { Trash } from 'react-feather';

import type { Product, SupplyProduct, SupplyProduct as SupplyProductType } from './inventory.data';
import type { InventorySkuSum } from '../services/product';
import SKUSelector from '@/modules/shared/components/SKUSelector';
import Table from '@/modules/shared/components/Table/Table';
import AlertMessage from '@/modules/auth/components/ErrorMessage';

import ProductService from '../services/product';

import supabase from '@/lib/supabase';
import useBusiness from '../hooks/useBusiness';
import useProduct from '../hooks/useProduct';

import onScan from 'onscan.js';
onScan.attachTo(document);

const productService = new ProductService(supabase);

export default function SupplyProduct({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
    const { data: businesses, isLoading: businessesLoading, error: businessesError } = useBusiness();
    const { sumInventory } = useProduct({});

    const [selectedBusinessId, setSelectedBusinessId] = useState<{ name: string; id: number }>();
    const [selectedProduct, setSelectedProduct] = useState<Product>();
    const [quantity, setQuantity] = useState<number>(1);

    const [productsPreview, setProductsPreview] = useState<SupplyProductType[]>([]);
    const [scanSearchLoading, setScanSearchLoading] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string>();

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
                    onClick={() =>
                        setProductsPreview(
                            productsPreview.filter(product => {
                                return product.id !== row.id || product.business.id !== row.business.id;
                            }),
                        )
                    }
                >
                    <Trash size={15} />
                </Button>
            ),
            sortable: false,
            reorder: true,
            omit: false,
        },
    ];

    async function handleSubmit(e: FormEvent<HTMLFormElement> | undefined) {
        e?.preventDefault();

        if (!selectedProduct || !selectedBusinessId || !quantity) return;

        submitProduct(selectedProduct, selectedBusinessId, quantity);
    }

    const submitProduct = useCallback(
        (product: Product, business: { name: string; id: number }, quantity: number) => {
            if (product && selectedBusinessId && quantity) {
                let existing = false;
                let copy_products_preview = [...productsPreview] as SupplyProduct[];

                for (const p of copy_products_preview) {
                    if (p.id === product.id && p.business.id === business.id) {
                        existing = true;
                        p.quantity += quantity;
                        break;
                    }
                }

                if (!existing) {
                    copy_products_preview = [{ ...product, business, quantity }, ...productsPreview];
                }

                setProductsPreview(copy_products_preview);

                setSelectedProduct(undefined);
                setQuantity(1);
            }
        },
        [productsPreview, selectedBusinessId],
    );

    async function handleSave() {
        if (!productsPreview.length) return;

        setError(undefined);
        setIsLoading(true);

        try {
            const sku_list: Array<InventorySkuSum> = productsPreview.map(p => ({
                sku: p.marketplace_product[0].marketplace_sku,
                quantity: p.quantity,
                business_id: p.business.id,
            }));

            const response = await sumInventory({ sku_list });

            if (response?.data?.error) {
                return setError(response?.data?.error);
            }

            setProductsPreview([]);
        } catch (error: any) {
            setError(error.message);
        } finally {
            setIsLoading(false);
        }
    }

    useEffect(() => {
        if (businesses?.length) {
            setSelectedBusinessId({ name: businesses[0].name, id: businesses[0].id });
        }
    }, [businesses]);

    useEffect(() => {
        async function onScan(props) {
            setScanSearchLoading(true);
            try {
                const { data } = await productService.getProducts({
                    search: props.detail.scanCode,
                    single: true,
                });
                console.log('[LS] -> src/modules/inventory/pages/SupplyProduct.tsx:186 -> data: ', data);

                if (!data) {
                    return setError('No se encontro el producto');
                }

                if (selectedBusinessId) {
                    submitProduct(data as Product, selectedBusinessId, 1);
                }
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
    }, [submitProduct, selectedBusinessId]);

    return (
        <Modal isOpen={isOpen} onOpenChange={onClose} size="5xl">
            <ModalContent className="relative">
                {scanSearchLoading && (
                    <div className="absolute flex justify-center w-full h-full bg-zinc-300 bg-opacity-70 z-50">
                        <Spinner color="primary" size="lg" />
                    </div>
                )}
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
                                            const businessId = Number.parseInt(Array.from(keys)[0] as string);

                                            const business = businesses?.find(business => business.id === businessId);
                                            console.log(
                                                '[LS] -> src/modules/inventory/pages/SupplyProduct.tsx:163 -> business: ',
                                                business,
                                            );

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
                                    isDisabled={isLoading}
                                >
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
