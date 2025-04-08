import supabase from '@/lib/supabase';
import { FileResponse } from '@/modules/folderNavigator/types/file'; 
import errorManager from '@/modules/organizations/errorManager/errorManager'; 


const getOrganizationBasicData = async (slug: string): Promise<FileResponse> => {
  const response = await supabase
    .from('organizations')
    .select('*')
    .eq('slug', slug);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Organization basic data retrieved successfully', data: response.data };
}

const getOrganizationBasicDataById = async (id: string): Promise<FileResponse> => {
  const response = await supabase
    .from('organizations')
    .select('*')
    .eq('id', id);

  if (response.error) return errorManager(response.error)

  return { error: false, message: 'Organization basic data retrieved successfully', data: response.data };
}

export default function useGetOrganizationData() {
  return {
    getOrganizationBasicData,
    getOrganizationBasicDataById
  }
}
