import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class BusinessService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getBusinesses() {
        return this.supabaseClient.from('business').select();
    }
}

export default BusinessService;
