import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/errorManager';
import type { OrganizationsResponse } from '../types/organizations';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

export interface UpdateOrganizationData {
    name?: string;
    description?: string;
    slug?: string;
}

export default function useOrganizations(user_id?: string, search?: string) {
    const {
        data: organizations,
        isLoading,
        error,
        count,
        mutate,
    } = useQuery(
        user_id
            ? supabase.rpc('get_user_organizations', { p_user_id: user_id, ...(search && { p_name: search }) })
            : null,
    );

    /**
     * Retrieves a list of organizations, with optional filtering by name and user_id.
     *
     * @param page The page number to retrieve.
     * @param pageSize The number of items per page.
     * @param name The name to filter by.
     * @param userID The user ID to filter by.
     * @returns An object with the organizations list, count and error status.
     */
    const getOrganizations = async (
        page: number,
        pageSize: number,
        name: string,
        userID: string,
    ): Promise<OrganizationsResponse> => {
        const response = await supabase.rpc('get_user_organizations', {
            p_user_id: userID,
            p_name: name && name.trim().length > 0 ? name.trim() : null,
            p_page: page,
            p_page_size: pageSize,
        });

        if (response.error) return errorManager(response.error);

        // The total count is included in each row, so we can get it from the first row
        const totalCount = response.data.length > 0 ? response.data[0].total_count : 0;

        return {
            error: false,
            message: 'Organizations retrieved successfully',
            data: response.data,
            count: totalCount,
        };
    };

    /**
     * Creates a new organization.
     * @param name The name of the organization.
     * @param description The description of the organization.
     * @param slug The slug of the organization.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the newly created organization.
     */
    const createOrganization = async (name: string, description: string, slug: string, userId: string) => {
        const response = await supabase
            .from('organizations')
            .insert({ user_id: userId, name, description, slug })
            .select()
            .single();

        if (response.error) return errorManager(response.error);

        const joinResponse = await supabase
            .from('organizations_users')
            .insert([
                {
                    user_id: userId,
                    organization_id: response.data.id,
                    roll_id: 'admin',
                },
            ])
            .select('*');

        if (joinResponse.error) return errorManager(joinResponse.error);

        return { error: false, message: 'Organization created successfully', data: response.data };
    };

    /**
     * Deletes an organization by its ID.
     * @param id The ID of the organization to delete.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the deleted organization.
     */
    const deleteOrganization = async (id: string) => {
        const response = await supabase.from('organizations').delete().eq('id', id);

        if (response.error) return errorManager(response.error);

        return { error: false, message: 'Organization deleted successfully', data: response.data };
    };

    /**
     * Updates an organization by its ID.
     * @param id The ID of the organization to update.
     * @param updateData An object containing the fields to update, this use the UpdateOrganizationData interface.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the updated organization.
     */
    const updateOrganization = async (id: string, updateData: UpdateOrganizationData) => {
        if (Object.keys(updateData).length === 0) {
            return {
                error: true,
                message: 'At least one field must be provided for update',
                data: null,
            };
        }

        const response = await supabase.from('organizations').update(updateData).eq('id', id).select();

        if (response.error) return errorManager(response.error);

        return {
            error: false,
            message: 'Organization updated successfully',
            data: response.data,
        };
    };

    /**
     * Retrieves the list of roles in the system.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with an array of roles.
     */
    const getUserRolls = async (): Promise<OrganizationsResponse> => {
        const response = await supabase.from('rolls').select('*');
        if (response.error) return errorManager(response.error);
        return { error: false, message: 'content retrieved successfully', data: response.data };
    };

    /**
     * Adds a user to an organization with a specified role.
     * @param userId - The ID of the user to add.
     * @param organizationId - The ID of the organization to join.
     * @param rollId - The ID of the role to assign to the user.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the added record.
     */

    const joinOrganization = async (
        userId: string,
        organizationId: string,
        rollId: string,
    ): Promise<OrganizationsResponse> => {
        const response = await supabase
            .from('organizations_users')
            .insert([
                {
                    user_id: userId,
                    organization_id: organizationId,
                    roll_id: rollId,
                },
            ])
            .select('*');

        if (response.error) return errorManager(response.error);
        return { error: false, message: 'content retrieved successfully', data: response.data };
    };

    /**
     * Removes a user from an organization.
     *
     * @param userId - The ID of the user to remove.
     * @param organizationId - The ID of the organization to leave.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the removed record.
     */

    const leaveOrganization = async (userId: string, organizationId: string): Promise<OrganizationsResponse> => {
        const response = await supabase
            .from('organizations_users')
            .delete()
            .eq('user_id', userId)
            .eq('organization_id', organizationId)
            .select('*');

        if (response.error) return errorManager(response.error);
        return { error: false, message: 'User removed from organization', data: response.data };
    };

    return {
        data: organizations,
        isLoading,
        error,
        count,
        mutate,
        getOrganizations,
        createOrganization,
        deleteOrganization,
        updateOrganization,
        getUserRolls,
        joinOrganization,
        leaveOrganization,
    };
}
