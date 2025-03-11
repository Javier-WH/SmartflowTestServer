import supabase from '../../../lib/supabase';
import errorManager from '../errorManager/errorManager';
import { OrganizationsResponse } from '../types/organizations';

export default function useOrganizations() {
  const getOrganizations = async (
    page: number,
    pageSize: number,
    name: string
  ): Promise<OrganizationsResponse> => {
    const itemsPerPage = pageSize;
    const start = (page - 1) * itemsPerPage;
    const end = start + itemsPerPage - 1;

    // Crear query base
    let query = supabase
      .from('organizations')
      .select('*', { count: 'exact' })
      .eq('open', true)
      .range(start, end);

    // Añadir filtro de búsqueda si hay nombre
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

  return { getOrganizations };
}