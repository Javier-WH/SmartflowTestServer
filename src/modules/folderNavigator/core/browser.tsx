import { useContext } from 'react';

import FolderContainer from '../componets/folderContainer';
import { MainContext, type MainContextValues } from '@/modules/mainContext';

export default function Browser() {
    const { rootFolder } = useContext(MainContext) as MainContextValues;

    return (
        <div className="w-full overflow-auto p-2 h-full">
            <FolderContainer folderId={rootFolder} />
        </div>
    );
}
