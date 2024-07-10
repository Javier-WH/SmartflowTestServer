import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class ProductService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getProducts() {
        return this.supabaseClient.from('product').select();
    }
}

export default ProductService;
