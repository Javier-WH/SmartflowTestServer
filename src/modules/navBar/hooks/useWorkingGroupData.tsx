import supabase from '@/lib/supabase';
import type { FileResponse } from '@/modules/folderNavigator/types/file';
import errorManager from '@/modules/working_group/errorManager/errorManager';

const getWorkingGroupBasicData = async (slug: string): Promise<FileResponse> => {
    const response = await supabase.from('working_group').select('*').eq('slug', slug);

    if (response.error) return errorManager(response.error);

    return { error: false, message: 'WorkingGroup basic data retrieved successfully', data: response.data };
};

const getWorkingGroupBasicDataById = async (id: string): Promise<FileResponse> => {
    const response = await supabase.from('working_group').select('*').eq('id', id);

    if (response.error) return errorManager(response.error);

    return { error: false, message: 'WorkingGroup basic data retrieved successfully', data: response.data };
};

export default function useGetWorkingGroupData() {
    return {
        getWorkingGroupBasicData,
        getWorkingGroupBasicDataById,
    };
}
