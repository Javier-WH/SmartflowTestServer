export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
            business: {
                Row: {
                    created_at: string;
                    id: number;
                    name: string;
                };
                Insert: {
                    created_at?: string;
                    id?: number;
                    name: string;
                };
                Update: {
                    created_at?: string;
                    id?: number;
                    name?: string;
                };
                Relationships: [];
            };
            business_product: {
                Row: {
                    business_id: number;
                    created_at: string;
                    id: number;
                    product_id: number;
                    sku: string;
                    stock: number;
                };
                Insert: {
                    business_id: number;
                    created_at?: string;
                    id?: number;
                    product_id: number;
                    sku: string;
                    stock?: number;
                };
                Update: {
                    business_id?: number;
                    created_at?: string;
                    id?: number;
                    product_id?: number;
                    sku?: string;
                    stock?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'business_product_business_id_fkey';
                        columns: ['business_id'];
                        isOneToOne: false;
                        referencedRelation: 'business';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'business_product_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'product';
                        referencedColumns: ['id'];
                    },
                ];
            };
            export_file: {
                Row: {
                    created_at: string;
                    entity: Database['public']['Enums']['marketplace_entity'];
                    id: number;
                    marketplace_id: number;
                    url: string;
                };
                Insert: {
                    created_at?: string;
                    entity: Database['public']['Enums']['marketplace_entity'];
                    id?: number;
                    marketplace_id: number;
                    url: string;
                };
                Update: {
                    created_at?: string;
                    entity?: Database['public']['Enums']['marketplace_entity'];
                    id?: number;
                    marketplace_id?: number;
                    url?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'export_file_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            marketplace: {
                Row: {
                    active: boolean | null;
                    api_host: string | null;
                    api_key: string | null;
                    created_at: string;
                    id: number;
                    name: string | null;
                };
                Insert: {
                    active?: boolean | null;
                    api_host?: string | null;
                    api_key?: string | null;
                    created_at?: string;
                    id?: number;
                    name?: string | null;
                };
                Update: {
                    active?: boolean | null;
                    api_host?: string | null;
                    api_key?: string | null;
                    created_at?: string;
                    id?: number;
                    name?: string | null;
                };
                Relationships: [];
            };
            marketplace_order_status: {
                Row: {
                    description: string | null;
                    id: number;
                    marketplace_id: number | null;
                    status: string | null;
                };
                Insert: {
                    description?: string | null;
                    id?: number;
                    marketplace_id?: number | null;
                    status?: string | null;
                };
                Update: {
                    description?: string | null;
                    id?: number;
                    marketplace_id?: number | null;
                    status?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'marketplace_order_status_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            marketplace_product: {
                Row: {
                    created_at: string;
                    id: number;
                    marketplace_id: number;
                    marketplace_sku: string;
                    product_id: number;
                };
                Insert: {
                    created_at?: string;
                    id?: number;
                    marketplace_id: number;
                    marketplace_sku: string;
                    product_id: number;
                };
                Update: {
                    created_at?: string;
                    id?: number;
                    marketplace_id?: number;
                    marketplace_sku?: string;
                    product_id?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'marketplace_product_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'marketplace_product_product_id_fkey';
                        columns: ['product_id'];
                        isOneToOne: false;
                        referencedRelation: 'product';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order: {
                Row: {
                    charges: Json[] | null;
                    created_at: string;
                    currency: string;
                    id: number;
                    internal_last_updated_date: string;
                    marketplace_id: number;
                    marketplace_status: string;
                    order_id: string;
                    order_lines: Json[] | null;
                    shipping_info: Json | null;
                    tax: Json[] | null;
                    total: string;
                    total_lines: string;
                    total_quantity: string | null;
                };
                Insert: {
                    charges?: Json[] | null;
                    created_at: string;
                    currency: string;
                    id?: number;
                    internal_last_updated_date?: string;
                    marketplace_id: number;
                    marketplace_status: string;
                    order_id: string;
                    order_lines?: Json[] | null;
                    shipping_info?: Json | null;
                    tax?: Json[] | null;
                    total: string;
                    total_lines: string;
                    total_quantity?: string | null;
                };
                Update: {
                    charges?: Json[] | null;
                    created_at?: string;
                    currency?: string;
                    id?: number;
                    internal_last_updated_date?: string;
                    marketplace_id?: number;
                    marketplace_status?: string;
                    order_id?: string;
                    order_lines?: Json[] | null;
                    shipping_info?: Json | null;
                    tax?: Json[] | null;
                    total?: string;
                    total_lines?: string;
                    total_quantity?: string | null;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_internal_status: {
                Row: {
                    description: string | null;
                    id: number;
                    name: string | null;
                    status: string | null;
                };
                Insert: {
                    description?: string | null;
                    id?: number;
                    name?: string | null;
                    status?: string | null;
                };
                Update: {
                    description?: string | null;
                    id?: number;
                    name?: string | null;
                    status?: string | null;
                };
                Relationships: [];
            };
            order_internal_status_history: {
                Row: {
                    created_at: string;
                    id: number;
                    order_id: number;
                    status_id: number;
                };
                Insert: {
                    created_at?: string;
                    id?: number;
                    order_id: number;
                    status_id: number;
                };
                Update: {
                    created_at?: string;
                    id?: number;
                    order_id?: number;
                    status_id?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_internal_status_history_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'order';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_internal_status_history_status_id_fkey';
                        columns: ['status_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_internal_status';
                        referencedColumns: ['id'];
                    },
                ];
            };
            product: {
                Row: {
                    active: boolean;
                    brand: string | null;
                    created_at: string;
                    currency: string | null;
                    ean: string | null;
                    gtin: string | null;
                    id: number;
                    name: string;
                    price: number | null;
                    status: string | null;
                    type: string | null;
                    upc: string | null;
                };
                Insert: {
                    active?: boolean;
                    brand?: string | null;
                    created_at?: string;
                    currency?: string | null;
                    ean?: string | null;
                    gtin?: string | null;
                    id?: number;
                    name: string;
                    price?: number | null;
                    status?: string | null;
                    type?: string | null;
                    upc?: string | null;
                };
                Update: {
                    active?: boolean;
                    brand?: string | null;
                    created_at?: string;
                    currency?: string | null;
                    ean?: string | null;
                    gtin?: string | null;
                    id?: number;
                    name?: string;
                    price?: number | null;
                    status?: string | null;
                    type?: string | null;
                    upc?: string | null;
                };
                Relationships: [];
            };
            role_permissions: {
                Row: {
                    id: number;
                    permission: Database['public']['Enums']['app_permission'];
                    role: Database['public']['Enums']['app_role'];
                };
                Insert: {
                    id?: number;
                    permission: Database['public']['Enums']['app_permission'];
                    role: Database['public']['Enums']['app_role'];
                };
                Update: {
                    id?: number;
                    permission?: Database['public']['Enums']['app_permission'];
                    role?: Database['public']['Enums']['app_role'];
                };
                Relationships: [];
            };
            scanned_product: {
                Row: {
                    category: string;
                    created_at: string;
                    id: number;
                    marketplace_id: number;
                    name: string;
                    product_id: string;
                    product_id_type: string;
                    sku: string;
                };
                Insert: {
                    category: string;
                    created_at?: string;
                    id?: number;
                    marketplace_id: number;
                    name: string;
                    product_id: string;
                    product_id_type: string;
                    sku: string;
                };
                Update: {
                    category?: string;
                    created_at?: string;
                    id?: number;
                    marketplace_id?: number;
                    name?: string;
                    product_id?: string;
                    product_id_type?: string;
                    sku?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'scanned_product_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            tracking_identifier: {
                Row: {
                    created_at: string;
                    entity: Database['public']['Enums']['marketplace_entity'];
                    id: number;
                    marketplace_id: number;
                    tracking_id: string;
                };
                Insert: {
                    created_at?: string;
                    entity: Database['public']['Enums']['marketplace_entity'];
                    id?: number;
                    marketplace_id: number;
                    tracking_id: string;
                };
                Update: {
                    created_at?: string;
                    entity?: Database['public']['Enums']['marketplace_entity'];
                    id?: number;
                    marketplace_id?: number;
                    tracking_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'tracking_identifier_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            user_roles: {
                Row: {
                    id: number;
                    role: Database['public']['Enums']['app_role'];
                    user_id: string;
                };
                Insert: {
                    id?: number;
                    role: Database['public']['Enums']['app_role'];
                    user_id: string;
                };
                Update: {
                    id?: number;
                    role?: Database['public']['Enums']['app_role'];
                    user_id?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'user_roles_user_id_fkey';
                        columns: ['user_id'];
                        isOneToOne: false;
                        referencedRelation: 'users';
                        referencedColumns: ['id'];
                    },
                ];
            };
        };
        Views: {
            [_ in never]: never;
        };
        Functions: {
            create_product: {
                Args: {
                    internal_sku: string;
                    product_marketplace_id: number;
                    product_marketplace_sku: string;
                    product_name: string;
                    brand: string;
                    type: string;
                    currency: string;
                    price: number;
                    product_upc: string;
                    product_ean: string;
                    product_gtin: string;
                    status: string;
                };
                Returns: undefined;
            };
            schedule_start_syncing_marketplace_orders: {
                Args: {
                    start_date: string;
                    end_date: string;
                };
                Returns: undefined;
            };
            schedule_start_syncing_marketplace_products: {
                Args: Record<PropertyKey, never>;
                Returns: undefined;
            };
        };
        Enums: {
            app_permission:
                | 'manage.all'
                | 'product.create'
                | 'product.read'
                | 'product.update'
                | 'product.deletemarketplace.create'
                | 'marketplace.read'
                | 'marketplace.update'
                | 'marketplace.deleteorder.create'
                | 'order.read'
                | 'order.update'
                | 'order.delete';
            app_role: 'admin' | 'warehouse' | 'finance';
            marketplace_entity: 'orders' | 'products';
        };
        CompositeTypes: {
            [_ in never]: never;
        };
    };
};

type PublicSchema = Database[Extract<keyof Database, 'public'>];

export type Tables<
    PublicTableNameOrOptions extends
        | keyof (PublicSchema['Tables'] & PublicSchema['Views'])
        | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof (Database[PublicTableNameOrOptions['schema']]['Tables'] &
              Database[PublicTableNameOrOptions['schema']]['Views'])
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? (Database[PublicTableNameOrOptions['schema']]['Tables'] &
          Database[PublicTableNameOrOptions['schema']]['Views'])[TableName] extends {
          Row: infer R;
      }
        ? R
        : never
    : PublicTableNameOrOptions extends keyof (PublicSchema['Tables'] & PublicSchema['Views'])
      ? (PublicSchema['Tables'] & PublicSchema['Views'])[PublicTableNameOrOptions] extends {
            Row: infer R;
        }
          ? R
          : never
      : never;

export type TablesInsert<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Insert: infer I;
      }
        ? I
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Insert: infer I;
        }
          ? I
          : never
      : never;

export type TablesUpdate<
    PublicTableNameOrOptions extends keyof PublicSchema['Tables'] | { schema: keyof Database },
    TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicTableNameOrOptions['schema']]['Tables']
        : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
    ? Database[PublicTableNameOrOptions['schema']]['Tables'][TableName] extends {
          Update: infer U;
      }
        ? U
        : never
    : PublicTableNameOrOptions extends keyof PublicSchema['Tables']
      ? PublicSchema['Tables'][PublicTableNameOrOptions] extends {
            Update: infer U;
        }
          ? U
          : never
      : never;

export type Enums<
    PublicEnumNameOrOptions extends keyof PublicSchema['Enums'] | { schema: keyof Database },
    EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database }
        ? keyof Database[PublicEnumNameOrOptions['schema']]['Enums']
        : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
    ? Database[PublicEnumNameOrOptions['schema']]['Enums'][EnumName]
    : PublicEnumNameOrOptions extends keyof PublicSchema['Enums']
      ? PublicSchema['Enums'][PublicEnumNameOrOptions]
      : never;
