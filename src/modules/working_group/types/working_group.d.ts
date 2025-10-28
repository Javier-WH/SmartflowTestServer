export interface WorkingGroupResponse {
    error: boolean;
    message: string;
    data?: Array<WorkingGroup>;
    count?: number | undefined;
}

export interface WorkingGroup {
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
    working_group_id?: string;
    status?: string;
    leveltitle?: string;
    read?: boolean;
    write?: boolean;
    delete?: boolean;
    invite?: boolean;
    configure?: boolean;
}

export interface WorkingGroupFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;
}

export interface WorkingGroupInviteData {
    created_at: string;
    email: string;
    id: string;
    invited_by: string;
    working_group_id: string;
    status: string;
}
