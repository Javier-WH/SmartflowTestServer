import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/errorManager';
import { OrganizationsResponse } from '../types/organizations';

export interface UpdateOrganizationData {
  name?: string;
  description?: string;
  slug?: string;
}

export default function useOrganizations() {

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
    userID?: string
  ): Promise<OrganizationsResponse> => {
    const itemsPerPage = pageSize;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    let query = supabase
      .from('organizations')
      .select(
        userID
          ? '*, organizations_users!inner(*)'  // JOIN si hay userID
          : '*',
        { count: 'exact' }
      )
      .eq('open', true)
      .range(start, end);

    // Filtro por usuario usando operador de relaciones
    if (userID) {
      query = query.contains('organizations_users.user_id', userID);
    }

    // Filtro por nombre
    if (name && name.trim().length > 0) {
      query = query.ilike('name', `%${name.trim()}%`);
    }

    const response = await query;

    if (response.error) return errorManager(response.error);

    return {
      error: false,
      message: 'Organizations retrieved successfully',
      data: response.data,
      count: response.count ?? undefined
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
  const createOrganization = async (name: string, description: string, slug: string) => {
    const response = await supabase
      .from('organizations')
      .insert({ name, description, slug })
      .select();

    if (response.error) return errorManager(response.error);

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
    const response = await supabase
      .from('organizations')
      .delete()
      .eq('id', id);

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
        data: null
      };
    }

    const response = await supabase
      .from('organizations')
      .update(updateData)
      .eq('id', id)
      .select();

    if (response.error) return errorManager(response.error);

    return {
      error: false,
      message: 'Organization updated successfully',
      data: response.data
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
    const response = await supabase
      .from('rolls')
      .select('*')
    if (response.error) return errorManager(response.error)
    return { error: false, message: 'content retrieved successfully', data: response.data };
  }

  
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

  const joinOrganization = async (userId: string, organizationId: string, rollId: string): Promise<OrganizationsResponse> => {
    const response = await supabase
      .from('organizations_users')
      .insert([{
        user_id: userId,
        organization_id: organizationId,
        roll_id: rollId
      }])
      .select('*');

    if (response.error) return errorManager(response.error)
    return { error: false, message: 'content retrieved successfully', data: response.data };
  }

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



  return { getOrganizations, createOrganization, deleteOrganization, updateOrganization, getUserRolls, joinOrganization, leaveOrganization };
}