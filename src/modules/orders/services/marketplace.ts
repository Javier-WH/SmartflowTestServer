import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class MarketplaceService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getMarketplaces() {
        return this.supabaseClient.from('marketplace').select('id, name, active').neq('active', false);
    }
}

export default MarketplaceService;
