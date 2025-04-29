import { useContext, useEffect, useRef } from 'react';

import FolderContainer from '../componets/folderContainer';
import { MainContext, type MainContextValues } from '@/modules/mainContext';

export default function Browser() {
    const { rootFolder } = useContext(MainContext) as MainContextValues;
    const observerRef = useRef<MutationObserver | null>(null);
    const processedFolders = useRef<Set<string>>(new Set());

    const openFolders = (depth: number) => {
        const folders = document.querySelectorAll(`.folder[data-depth="${depth}"]:not(.opened)`);

        folders.forEach(folder => {
            const folderId = folder.id;
            if (!processedFolders.current.has(folderId)) {
                folder.dispatchEvent(new MouseEvent('click', { bubbles: true }));
                processedFolders.current.add(folderId);
            }
        });
    };

    // open folders at start if they are in root
    useEffect(() => {
        observerRef.current = new MutationObserver(() => {
            // Verificar primer nivel
            if (processedFolders.current.size === 0) {
                openFolders(0);
            }

            // Verificar segundo nivel después de abrir el primero
            if (document.querySelectorAll('.folder[data-depth="0"].opened').length > 0) {
                openFolders(1);
            }
        });

        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class']
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);

    return (
        <div className="w-full overflow-auto p-2 h-full">
            <FolderContainer folderId={rootFolder} depth={0} />
        </div>
    );
}
