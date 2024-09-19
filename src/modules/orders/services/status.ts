import type { Database } from '@/types/supabase';
import type { SupabaseClient } from '@supabase/supabase-js';

class StatusService {
    private supabaseClient: SupabaseClient<Database>;

    constructor(supabaseClient: SupabaseClient<Database>) {
        this.supabaseClient = supabaseClient;
    }

    getStatus() {
        return this.supabaseClient.from('order_internal_status').select('*');
    }
}

export default StatusService;
