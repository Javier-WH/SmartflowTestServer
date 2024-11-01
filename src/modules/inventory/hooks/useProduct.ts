import supabase from '@/lib/supabase';

import { type UseQueryReturn, useQuery } from '@supabase-cache-helpers/postgrest-swr';

import ProductService from '../services/product';
import type { Product } from '../pages/inventory.data';

const productService = new ProductService(supabase);

export default function useProduct({
    page,
    rowsPerPage,
    search,
}: { page?: number; rowsPerPage?: number; search?: string }) {
    const {
        data: products,
        isLoading,
        error,
        mutate,
        count,
    } = useQuery(productService.getProducts({ page, rowsPerPage, search })) as UseQueryReturn<Product>;

    function generateSKU() {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        const result = [];
        for (let i = 0; i < 6; i++) {
            result.push(chars.charAt(Math.floor(Math.random() * chars.length)));
        }
        return result.join('');
    }

    async function createProduct({
        sku,
        name,
        brand,
        price,
        ean,
        marketplace_id,
        marketplace_sku,
    }: {
        sku: string;
        name: string;
        brand: string;
        price: number;
        ean: string;
        marketplace_id: string;
        marketplace_sku: string;
    }) {
        const response = await productService.createProduct({
            sku,
            name,
            brand,
            price,
            ean,
            marketplace_id,
            marketplace_sku,
        });

        return response;
    }

    return {
        data: products ?? [],
        totalRecords: count,
        isLoading,
        error: error?.message,
        mutate,
        generateSKU,
        createProduct,
    };
}
