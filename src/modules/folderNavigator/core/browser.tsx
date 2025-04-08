import { useContext } from 'react';

import FolderContainer from '../componets/folderContainer';
import { MainContext, type MainContextValues } from '@/modules/mainContext';

export default function Browser() {
    const { rootFolder } = useContext(MainContext) as MainContextValues;

    return (
        <div className="max-h-[500px] w-full max-w-4xl overflow-auto bg-white">
            <FolderContainer folderId={rootFolder} />
        </div>
    );
}
