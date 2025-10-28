import { useQuery } from '@supabase-cache-helpers/postgrest-swr';
import { t } from 'i18next';
import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/errorManager';
import type { WorkingGroupResponse } from '../types/working_group';

export interface UpdateWorkingGroupData {
    name?: string;
    description?: string;
    slug?: string;
}

// Define a consistent response type for all functions
interface WorkingGroupActionResponse {
    error: boolean;
    message: string;
    data?: unknown;
}

export default function useWorkingGroups(user_id?: string, search?: string) {
    const {
        data: working_groups,
        isLoading,
        error,
        count,
        mutate,
    } = useQuery(
        user_id
            ? supabase.rpc('get_user_working_groups', {
                  p_user_id: user_id,
                  ...(search && { p_name: search }),
                  p_page: 1,
                  p_page_size: 100,
              })
            : null,
    );

    /**
     * Retrieves a list of working groups, with optional filtering by name and user_id.
     *
     * @param page The page number to retrieve.
     * @param pageSize The number of items per page.
     * @param name The name to filter by.
     * @param userID The user ID to filter by.
     * @returns An object with the working group list, count and error status.
     */
    const getWorkingGroups = async (
        page: number,
        pageSize: number,
        name: string,
        userID: string,
    ): Promise<WorkingGroupResponse> => {
        const response = await supabase.rpc('get_user_working_groups', {
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
            message: t('WorkingGroups_retrieved_successfully'),
            data: response.data,
            count: totalCount,
        };
    };

    /**
     * Creates a new working group.
     *
     * @param {string} name - The name of the working group.
     * @param {string} description - The description of the working group.
     * @param {string} slug - The slug of the working group.
     * @param {string} user_id - The ID of the user creating the working group.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const createWorkingGroup = async (
        name: string,
        description: string,
        slug: string,
        user_id: string,
    ): Promise<WorkingGroupActionResponse> => {
        const response = await supabase
            .from('working_group')
            .insert({ user_id, name, description, slug })
            .select('*, working_group_users(*)')
            .single();

        console.error('error', response.error);

        if (response.error) return errorManager(response.error);

        const joinResponse = await supabase
            .from('working_group_users')
            .insert([
                {
                    user_id,
                    working_group_id: response.data.id,
                    roll_id: '320ef7c2-615e-43e3-a855-7577577ce33d',
                },
            ])
            .select('*');

        console.log('joinResponse error', joinResponse.error);
        if (joinResponse.error) return errorManager(joinResponse.error);

        return { error: false, message: t('WorkingGroup_created_successfully'), data: response.data };
    };

    /**
     * Updates a working group with the provided data.
     *
     * @param {string} id - The ID of the working group to update.
     * @param {WorkingGroupUpdateData} data - The data to update the working group with.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const updateWorkingGroup = async (
        id: string,
        data: UpdateWorkingGroupData,
    ): Promise<WorkingGroupActionResponse> => {
        if (Object.keys(data).length === 0) {
            return {
                error: true,
                message: t('No_data_provided'),
                data: null,
            };
        }

        const response = await supabase.from('working_group').update(data).eq('id', id).select();

        if (response.error) return errorManager(response.error);

        mutate();
        return {
            error: false,
            message: t('WorkingGroup_updated_successfully'),
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
    const getUserRolls = async (): Promise<WorkingGroupResponse> => {
        const response = await supabase.from('rolls').select('*');
        if (response.error) return errorManager(response.error);
        return { error: false, message: t('Roles_retrieved_successfully'), data: response.data };
    };

    /**
     * Updates the role of a user in a working group.
     *
     * @param {string} roll_id - The ID of the new role to assign to the user.
     * @param {string} user_id - The ID of the user to update.
     * @param {string} working_group_id - The ID of the working group in which to update the user's role.
     * @returns {Promise<WorkingGroupResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const updateUserRoll = async ({
        roll_id,
        user_id,
        working_group_id,
    }: {
        roll_id: string;
        user_id: string;
        working_group_id: string;
    }): Promise<WorkingGroupResponse> => {
        const response = await supabase
            .from('working_group_users')
            .update({ roll_id })
            .eq('user_id', user_id)
            .eq('working_group_id', working_group_id)
            .select('*');
        if (response.error) return errorManager(response.error);
        return { error: false, message: t('Role_updated_successfully'), data: response.data };
    };

    /**
     * Adds a user to an working group with a specified role.
     * @param userId - The ID of the user to add.
     * @param workingGroupId - The ID of the working group to join.
     * @param rollId - The ID of the role to assign to the user.
     * @returns A Promise that resolves to an object with an `error` property
     * (boolean indicating if the function succeeded) and a `message` property (string
     * describing the outcome of the operation). If the operation was successful, the
     * object will also contain a `data` property with the added record.
     */

    const joinWorkingGroup = async (
        userId: string,
        workingGroupId: string,
        rollId: string,
    ): Promise<WorkingGroupResponse> => {
        const response = await supabase
            .from('working_group_users')
            .insert([
                {
                    user_id: userId,
                    working_group_id: workingGroupId,
                    roll_id: rollId,
                },
            ])
            .select('*');

        if (response.error) return errorManager(response.error);

        // update the status of the invitation
        const working_group_id = response.data[0].working_group_id;
        const updateResponse = await supabase
            .from('working_group_invitations')
            .update({ status: 'accepted' })
            .eq('working_group_id', working_group_id);

        if (updateResponse.error) return errorManager(updateResponse.error);

        return { error: false, message: t('You_have_joined_the_working_group'), data: response.data };
    };

    /**
     * Allows a user to leave a working group they are a member of.
     *
     * @param {string} workingGroupId - The ID of the working group to leave.
     * @param {string} userId - The ID of the user leaving the working group.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const leaveWorkingGroup = async (workingGroupId: string, userId: string): Promise<WorkingGroupActionResponse> => {
        // Delete the working_group_members record for this user and working group
        const response = await supabase
            .from('working_group_users')
            .delete()
            .eq('working_group_id', workingGroupId)
            .eq('user_id', userId);

        if (response.error) return errorManager(response.error);

        mutate();
        return { error: false, message: t('You_have_left_the_working_group'), data: response.data };
    };

    /**
     * Invites a user to join an working group via email.
     *
     * @param {string} workingGroupId - The ID of the working group to invite to.
     * @param {string} email - The email of the user to invite.
     * @param {string} inviterUserId - The ID of the user sending the invitation.
     * @param {string} [level_id] - The ID of the role to assign to the invited user upon acceptance.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const inviteUserToWorkingGroup = async (
        workingGroupId: string,
        email: string,
        inviterUserId: string,
        level_id?: string,
    ): Promise<WorkingGroupActionResponse> => {
        // First, check if the working group exists and the inviter is the creator
        const orgResponse = await supabase
            .from('working_group')
            .select('*')
            .eq('id', workingGroupId)
            //.eq('user_id', inviterUserId)
            .single();

        if (orgResponse.error) {
            return {
                error: true,
                //message: 'You do not have permission to invite users to this working group',
                message: t('working_group_not_found'),
                data: null,
            };
        }

        const isUserInWorkingGroup = await supabase.rpc('is_user_in_working_group', {
            p_email: email.toLowerCase().trim(),
            p_working_group_id: workingGroupId,
        });

        if (isUserInWorkingGroup.error) {
            return {
                error: true,
                message: t('Something_went_wrong'),
                data: null,
            };
        }
        if (isUserInWorkingGroup.data) {
            return {
                error: true,
                message: t('User_already_in_working_group'),
                data: null,
            };
        }

        // Create an invitation record
        const invitationResponse = await supabase
            .from('working_group_invitations')
            .insert({
                working_group_id: workingGroupId,
                email: email.toLowerCase().trim(),
                invited_by: inviterUserId,
                status: 'pending',
                level_id: level_id || null,
            })
            .select();

        if (invitationResponse.error) {
            // Check if it's a unique constraint error (invitation already exists)
            if (invitationResponse.error.code === '23505') {
                return {
                    error: true,
                    message: t('invitation_already_exists'),
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
     * Deletes an invitation to a working group by its ID and email.
     *
     * @param {string} working_group_id - The ID of the working group to delete the invitation from.
     * @param {string} email - The email of the user to delete the invitation for.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const deleteInvitation = async (working_group_id: string, email: string): Promise<WorkingGroupActionResponse> => {
        const response = await supabase
            .from('working_group_invitations')
            .delete()
            .eq('working_group_id', working_group_id)
            .eq('email', email);
        if (response.error) return errorManager(response.error);
        return { error: false, message: t('Invitation_deleted_successfully'), data: response.data };
    };

    /**
     * Deletes a working group by its ID.
     *
     * @param {string} id - The ID of the working group to delete.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and optional data.
     */
    const deleteWorkingGroupById = async (id: string): Promise<WorkingGroupActionResponse> => {
        const response = await supabase.from('working_group').delete().eq('id', id);

        if (response.error) return errorManager(response.error);

        return { error: false, message: t('WorkingGroup_deleted_successfully'), data: response.data };
    };

    /**
     * Retrieves a pending invitation by its ID.
     *
     * @param {string} id - The ID of the invitation to retrieve.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object containing
     * the error status, a message, and the invitation data if found.
     */

    const getWorkingGroupInvite = async (id: string): Promise<WorkingGroupActionResponse> => {
        const response = await supabase
            .from('working_group_invitations')
            .select('*')
            .eq('id', id)
            .eq('status', 'pending');

        if (response.error) return errorManager(response.error);
        return { error: false, message: t('Invitation_retrieved_successfully'), data: response.data };
    };

    /**
     * Retrieves the members of a specified working group.
     *
     * @param {string} a_working_group_id - The ID of the working group whose members are to be retrieved.
     * @returns {Promise<WorkingGroupActionResponse>} - A promise that resolves to an object with error status, message, and data containing the working group members.
     */

    const getWorkingGroupMembers = async (a_working_group_id: string): Promise<WorkingGroupActionResponse> => {
        const response = await supabase.rpc('getmembers', {
            a_working_group_id,
        });

        if (response.error) {
            console.log(error);
            return errorManager(error);
        } else {
            return { error: false, message: t('Members_retrieved_successfully'), data: response.data };
        }
    };

    return {
        data: working_groups,
        isLoading,
        error,
        count,
        mutate,
        getWorkingGroups,
        createWorkingGroup,
        deleteWorkingGroup: deleteWorkingGroupById,
        updateWorkingGroup,
        getUserRolls,
        updateUserRoll,
        joinWorkingGroup,
        deleteInvitation,
        leaveWorkingGroup,
        inviteUserToWorkingGroup,
        getWorkingGroupInvite,
        getWorkingGroupMembers,
    };
}
