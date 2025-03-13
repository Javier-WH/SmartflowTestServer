export interface OrganizationsResponse {
    error: boolean;
    message: string;
    data?: Array<Organization>;
    count?: number | undefined;
}

export interface Organization {
    id: string;
    name: string;
    description: string;
    slug: string;
    open: boolean;
    created_at: string;
    user_id: string;
    is_creator?: boolean;
    is_member?: boolean;
}

export interface OrganizationFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;
}
