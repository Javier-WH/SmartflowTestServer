import { useContext, /*useEffect, useRef*/ } from 'react';
import FolderContainer from '../componets/folderContainer';
import { MainContext, type MainContextValues } from '@/modules/mainContext';
import './browser.css';

export default function Browser() {
    const { rootFolder, setSelectedFolderId } = useContext(MainContext) as MainContextValues;
    /*const observerRef = useRef<MutationObserver | null>(null);
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
            // Check first level
            if (processedFolders.current.size === 0) {
                openFolders(0);
            }

            // Check second level if first level is opened
            if (document.querySelectorAll('.folder[data-depth="0"].opened').length > 0) {
                openFolders(1);
            }
        });

        observerRef.current.observe(document.body, {
            childList: true,
            subtree: true,
            attributes: true,
            attributeFilter: ['class'],
        });

        return () => {
            observerRef.current?.disconnect();
        };
    }, []);*/

    const checkClick = (e: React.MouseEvent) => {
      
        if ((e.target as HTMLElement).classList.contains('folder')) {
            setSelectedFolderId((e.target as HTMLElement).id);
            return
        }
        setSelectedFolderId(null);
        
    }
 

    return (
        <div className="main-folder-container w-full p-2 h-full max-w-[99%]" onClick={checkClick}>
     
            <FolderContainer folderId={rootFolder} depth={0} />
        </div>
    );
}
