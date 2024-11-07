// @ts-nocheck
import { useState } from 'react';

import AsyncSelect from 'react-select/async';

import supabase from '@/lib/supabase';
import ProductService from '@/modules/inventory/services/product';
import type { Product } from '@/modules/inventory/pages/inventory.data';

const productService = new ProductService(supabase);

export default function SKUSelector({
    value,
    onChange,
}: { value: Product | undefined; onChange: (value: Product | undefined) => void }) {
    const [isProductsLoading, setIsProductsLoading] = useState(false);

    async function loadOptions(inputValue: string) {
        setIsProductsLoading(true);
        const { data, error } = await productService.getProducts({ search: inputValue, page: 1, rowsPerPage: 100 });
        setIsProductsLoading(false);

        // NOTE: Typescript might be annoying
        const products = data as unknown as Product[];

        if (error) {
            console.error(error);
            return [];
        }

        const options = products?.map(product => ({
            label: (
                <span className="capitalize">
                    {product.marketplace_product?.[0].marketplace_sku} - {product.name}
                </span>
            ),
            value: product,
        }));

        return options ?? [];
    }

    return (
        <AsyncSelect
            isLoading={isProductsLoading}
            loadOptions={loadOptions}
            defaultOptions
            cacheOptions
            className="w-full"
            placeholder="Search for a product"
            classNames={{ control: () => 'h-full rounded-lg' }}
            menuPosition="fixed"
            styles={{ menuPortal: base => ({ ...base, zIndex: 9999 }) }}
            onChange={value => onChange(value?.value)}
            value={{ label: value?.name, value }}
        />
    );
}
