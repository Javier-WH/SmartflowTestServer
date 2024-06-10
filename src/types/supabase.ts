export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
    public: {
        Tables: {
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
            marketplace_product: {
                Row: {
                    brand: string | null;
                    created_at: string;
                    description: string | null;
                    discounted_price: number;
                    id: number;
                    internal_sku: string | null;
                    marketplace_id: number;
                    name: string | null;
                    offer_id: number;
                    price: number;
                    product_sku: string;
                    quantity: number;
                    shop_sku: string;
                };
                Insert: {
                    brand?: string | null;
                    created_at?: string;
                    description?: string | null;
                    discounted_price: number;
                    id?: number;
                    internal_sku?: string | null;
                    marketplace_id: number;
                    name?: string | null;
                    offer_id: number;
                    price: number;
                    product_sku: string;
                    quantity: number;
                    shop_sku: string;
                };
                Update: {
                    brand?: string | null;
                    created_at?: string;
                    description?: string | null;
                    discounted_price?: number;
                    id?: number;
                    internal_sku?: string | null;
                    marketplace_id?: number;
                    name?: string | null;
                    offer_id?: number;
                    price?: number;
                    product_sku?: string;
                    quantity?: number;
                    shop_sku?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'marketplace_product_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
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
                    internal_status_id: number | null;
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
                    internal_status_id?: number | null;
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
                    internal_status_id?: number | null;
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
                        foreignKeyName: 'order_internal_status_id_fkey';
                        columns: ['internal_status_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_status';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_charge: {
                Row: {
                    amount: string;
                    currency: string;
                    id: number;
                    marketplace_order_id: string;
                    order_id: number;
                    type: string;
                };
                Insert: {
                    amount: string;
                    currency: string;
                    id?: number;
                    marketplace_order_id: string;
                    order_id: number;
                    type: string;
                };
                Update: {
                    amount?: string;
                    currency?: string;
                    id?: number;
                    marketplace_order_id?: string;
                    order_id?: number;
                    type?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_charge_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'order';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_item: {
                Row: {
                    commission_amount: string;
                    commission_currency: string;
                    condition: string;
                    id: number;
                    marketplace_order_id: string;
                    offer_id: string;
                    order_id: number;
                    product_name: string;
                    shipping_method: string;
                    sku: string;
                    status_id: number | null;
                    unit_price_amount: string;
                    unit_price_currency: string;
                    unit_price_without_tax_amount: string;
                    unit_price_without_tax_currency: string;
                    upc: string;
                };
                Insert: {
                    commission_amount: string;
                    commission_currency: string;
                    condition: string;
                    id?: number;
                    marketplace_order_id: string;
                    offer_id: string;
                    order_id: number;
                    product_name: string;
                    shipping_method: string;
                    sku: string;
                    status_id?: number | null;
                    unit_price_amount: string;
                    unit_price_currency: string;
                    unit_price_without_tax_amount: string;
                    unit_price_without_tax_currency: string;
                    upc: string;
                };
                Update: {
                    commission_amount?: string;
                    commission_currency?: string;
                    condition?: string;
                    id?: number;
                    marketplace_order_id?: string;
                    offer_id?: string;
                    order_id?: number;
                    product_name?: string;
                    shipping_method?: string;
                    sku?: string;
                    status_id?: number | null;
                    unit_price_amount?: string;
                    unit_price_currency?: string;
                    unit_price_without_tax_amount?: string;
                    unit_price_without_tax_currency?: string;
                    upc?: string;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_item_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'order';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_item_status_id_fkey';
                        columns: ['status_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_status';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_item_status: {
                Row: {
                    created_at: string;
                    id: number;
                    marketplace_order_id: string;
                    order_item_id: number;
                    status_id: number;
                };
                Insert: {
                    created_at?: string;
                    id?: number;
                    marketplace_order_id: string;
                    order_item_id: number;
                    status_id: number;
                };
                Update: {
                    created_at?: string;
                    id?: number;
                    marketplace_order_id?: string;
                    order_item_id?: number;
                    status_id?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_item_status_order_item_id_fkey';
                        columns: ['order_item_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_item';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_item_status_status_id_fkey';
                        columns: ['status_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_status';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_status: {
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
                        foreignKeyName: 'order_status_marketplace_id_fkey';
                        columns: ['marketplace_id'];
                        isOneToOne: false;
                        referencedRelation: 'marketplace';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_status_history: {
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
                        foreignKeyName: 'order_status_history_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'order';
                        referencedColumns: ['id'];
                    },
                    {
                        foreignKeyName: 'order_status_history_status_id_fkey';
                        columns: ['status_id'];
                        isOneToOne: false;
                        referencedRelation: 'order_status';
                        referencedColumns: ['id'];
                    },
                ];
            };
            order_tax: {
                Row: {
                    amount: string;
                    currency: string;
                    id: number;
                    marketplace_order_id: string;
                    name: string;
                    order_id: number;
                };
                Insert: {
                    amount: string;
                    currency: string;
                    id?: number;
                    marketplace_order_id: string;
                    name: string;
                    order_id: number;
                };
                Update: {
                    amount?: string;
                    currency?: string;
                    id?: number;
                    marketplace_order_id?: string;
                    name?: string;
                    order_id?: number;
                };
                Relationships: [
                    {
                        foreignKeyName: 'order_tax_order_id_fkey';
                        columns: ['order_id'];
                        isOneToOne: false;
                        referencedRelation: 'order';
                        referencedColumns: ['id'];
                    },
                ];
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
            [_ in never]: never;
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
