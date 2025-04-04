import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/errorManager';
import type { OrganizationsResponse } from '../types/organizations';
import { useQuery } from '@supabase-cache-helpers/postgrest-swr';

export interface UpdateOrganizationData {
    name?: string;
    description?: string;
    slug?: string;
}

// Define a consistent response type for all functions
interface OrganizationActionResponse {
    error: boolean;
    message: string;
    data?: unknown;
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
     *
     * @param {string} name - The name of the organization.
     * @param {string} description - The description of the organization.
     * @param {string} slug - The slug of the organization.
     * @param {string} user_id - The ID of the user creating the organization.
     * @returns {Promise<OrganizationActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const createOrganization = async (
        name: string,
        description: string,
        slug: string,
        user_id: string,
    ): Promise<OrganizationActionResponse> => {
        const response = await supabase
            .from('organizations')
            .insert({ user_id, name, description, slug })
            .select('*, organizations_users(*)')
            .single();

        if (response.error) return errorManager(response.error);

        const joinResponse = await supabase
            .from('organizations_users')
            .insert([
                {
                    user_id,
                    organization_id: response.data.id,
                    roll_id: '320ef7c2-615e-43e3-a855-7577577ce33d',
                },
            ])
            .select('*');

        if (joinResponse.error) return errorManager(joinResponse.error);

        return { error: false, message: 'Organization created successfully', data: response.data };
    };

    /**
     * Updates an organization with the provided data.
     *
     * @param {string} id - The ID of the organization to update.
     * @param {OrganizationUpdateData} data - The data to update the organization with.
     * @returns {Promise<OrganizationActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const updateOrganization = async (
        id: string,
        data: UpdateOrganizationData,
    ): Promise<OrganizationActionResponse> => {
        if (Object.keys(data).length === 0) {
            return {
                error: true,
                message: 'At least one field must be provided for update',
                data: null,
            };
        }

        const response = await supabase.from('organizations').update(data).eq('id', id).select();

        if (response.error) return errorManager(response.error);

        mutate();
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

        // update the status of the invitation
        const organization_id = response.data[0].organization_id
        const updateResponse = await supabase
            .from('organization_invitations')
            .update({ status: 'accepted' })
            .eq('organization_id', organization_id)

        if (updateResponse.error) return errorManager(updateResponse.error);

        return { error: false, message: 'content retrieved successfully', data: response.data };
    };

    /**
     * Allows a user to leave an organization they are a member of.
     *
     * @param {string} organizationId - The ID of the organization to leave.
     * @param {string} userId - The ID of the user leaving the organization.
     * @returns {Promise<OrganizationActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const leaveOrganization = async (organizationId: string, userId: string): Promise<OrganizationActionResponse> => {
        // Delete the organization_members record for this user and organization
        const response = await supabase
            .from('organizations_users')
            .delete()
            .eq('organization_id', organizationId)
            .eq('user_id', userId);

        if (response.error) return errorManager(response.error);

        mutate();
        return { error: false, message: 'You have left the organization', data: response.data };
    };

    /**
     * Invites a user to join an organization via email.
     *
     * @param {string} organizationId - The ID of the organization to invite to.
     * @param {string} email - The email of the user to invite.
     * @param {string} inviterUserId - The ID of the user sending the invitation.
     * @returns {Promise<OrganizationActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const inviteUserToOrganization = async (
        organizationId: string,
        email: string,
        inviterUserId: string,
    ): Promise<OrganizationActionResponse> => {
        // First, check if the organization exists and the inviter is the creator
        const orgResponse = await supabase
            .from('organizations')
            .select('*')
            .eq('id', organizationId)
            .eq('user_id', inviterUserId)
            .single();


        if (orgResponse.error) {
            return {
                error: true,
                message: 'You do not have permission to invite users to this organization',
                data: null,
            };
        }

        // Create an invitation record
        const invitationResponse = await supabase
            .from('organization_invitations')
            .insert({
                organization_id: organizationId,
                email: email.toLowerCase().trim(),
                invited_by: inviterUserId,
                status: 'pending',
            })
            .select();


        if (invitationResponse.error) {
            // Check if it's a unique constraint error (invitation already exists)
            if (invitationResponse.error.code === '23505') {
                return {
                    error: true,
                    message: 'An invitation has already been sent to this email',
                    data: null,
                };
            }
            return errorManager(invitationResponse.error);
        }

        // Here you would typically trigger an email sending function
        // This could be done via a Supabase Edge Function, a webhook, or another service

        // For now, we'll just return success
        return {
            error: false,
            message: `Invitation sent to ${email}`,
            data: invitationResponse.data,
        };
    };

    /**
     * Deletes an organization by its ID.
     *
     * @param {string} id - The ID of the organization to delete.
     * @returns {Promise<OrganizationActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const deleteOrganizationById = async (id: string): Promise<OrganizationActionResponse> => {
        const response = await supabase.from('organizations').delete().eq('id', id);

        if (response.error) return errorManager(response.error);

        return { error: false, message: 'Organization deleted successfully', data: response.data };
    };

    const getOrganizationInvite = async (id: string): Promise<OrganizationActionResponse> => {
        const response = await supabase.from('organization_invitations')
            .select('*')
            .eq('id', id)
            .eq('status', 'pending');

        if (response.error) return errorManager(response.error);
        return { error: false, message: 'content retrieved successfully', data: response.data }
    };


    const getOrganizationMembers = async (a_organization_id: string): Promise<OrganizationActionResponse> => {
        const response = await supabase
            .rpc('getmembers', {
                a_organization_id
            });

        if (response.error) {
            console.log(error);
            return errorManager(error)
        } else {
            return { error: false, message: 'Organization members retrieved successfully', data: response.data };
        }
    }




    return {
        data: organizations,
        isLoading,
        error,
        count,
        mutate,
        getOrganizations,
        createOrganization,
        deleteOrganization: deleteOrganizationById,
        updateOrganization,
        getUserRolls,
        joinOrganization,
        leaveOrganization,
        inviteUserToOrganization,
        getOrganizationInvite,
        getOrganizationMembers
    };
}
