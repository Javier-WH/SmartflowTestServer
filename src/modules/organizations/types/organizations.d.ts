export interface OrganizationsResponse {
    error: boolean;
    message: string;
    data?: Array<Organization>;
    count?: number | undefined;
}



export interface Organization {
    id?: string;
    name?: string;
    description?: string;
    slug?: string;
    open?: boolean;
    created_at?: string;
    user_id?: string;
    is_creator?: boolean;
    is_member?: boolean;
    email?: string;
    invited_by?: string;
    organization_id?: string;
    status?: string;
    
}

export interface OrganizationFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;

}

export interface OrganizarionInviteData {
    created_at: string;
    email: string;
    id: string;
    invited_by: string;
    organization_id: string;
    status: string;
}