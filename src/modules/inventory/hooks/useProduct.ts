import supabase from '@/lib/supabase';

import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

import ProductService from '../services/product';

const productService = new ProductService(supabase);

export default function useProduct() {
    const { data: products, isLoading, error, mutate } = useQuery(productService.getProducts());

    return {
        data: products ?? [],
        isLoading,
        error: error?.message,
        mutate,
    };
}
