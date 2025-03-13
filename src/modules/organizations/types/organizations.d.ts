export interface Organization {
    id: number;
    name: string;
    description?: string;
    slug: string;
    open: boolean;
    created_at: string;
}
export interface OrganizationsResponse {
    error: boolean;
    message: string;
    data?: Array<Organization>;
    count?: number | undefined;
}
