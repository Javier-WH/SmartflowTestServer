import { Input } from '@/components/ui';
import { useEffect, useState, useCallback } from 'react';
import { IoSearchSharp } from 'react-icons/io5';
import useFilesManager from '../folderNavigator/hooks/useFileManager';
import type { SearchBoxInterface } from './types/searchBox';
import SearchBox from './searchBox/searchBox';
import { useTranslation } from 'react-i18next';


const debounce = (func, delay) => {
    let timeout;
    return (...args) => {
        clearTimeout(timeout); // Limpia el temporizador anterior si la función se llama de nuevo
        timeout = setTimeout(() => func.apply(this, args), delay); // Establece un nuevo temporizador
    };
};

export default function SearchInput() {
    const [searchValue, setSearchValue] = useState(''); 
    const [searchResults, setSearchResults] = useState<SearchBoxInterface[]>([]); 
    const [isLoading, setIsLoading] = useState(false); 
    const [error, setError] = useState<string | null>(null); 
    const { searchFiles } = useFilesManager(); 
    const { t } = useTranslation(); 

    
    // eslint-disable-next-line react-hooks/exhaustive-deps
    const debouncedSearch = useCallback(
        debounce(async (term, orgId) => {
    
            if (!term) {
                closeBox(); 
                return;
            }

            setIsLoading(true); 
            setError(null); 

            try {
                const res = await searchFiles(term, orgId); 
                setSearchResults(res.data); 
            } catch (err) {
                console.error("Error al obtener los resultados de la búsqueda:", err);
                setError(t('search_error_message')); 
                setSearchResults([]); 
            } finally {
                setIsLoading(false); 
            }
        }, 300), 
        [searchFiles, t] 
    );

    // Efecto para disparar la búsqueda cuando cambia el valor del input
    useEffect(() => {
        const orgId = localStorage.getItem('OrgId'); 
        if (!orgId) {
            setError(t('org_id_missing_error'));
            closeBox();
            return;
        }

        // Dispara la búsqueda "debounced" cuando searchValue cambia
        debouncedSearch(searchValue, orgId);

    }, [searchValue, debouncedSearch, t]); 

    // Efecto para manejar eventos de teclado (ej. tecla 'Escape' para cerrar la caja de búsqueda)
    useEffect(() => {
        const keyEvent = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeBox(); 
            }
        };
        const clickEvent = (e) => {
            if (e.target.id === 'searchInput' || e.target.id === 'searchBox') return;
            closeBox(); 
        };

        window.addEventListener('keydown', keyEvent); 
        window.addEventListener('click', clickEvent);
        return () => {
            window.removeEventListener('keydown', keyEvent); 
            window.removeEventListener('click', clickEvent);
        };
    }, []);

    // Función para cerrar la caja de resultados y resetear el estado
    const closeBox = () => {
        setSearchResults([]);
        setSearchValue(''); 
        setIsLoading(false); 
        setError(null); 
    };

    return (
        <div style={{ width: '100%', position: 'relative', border: '1px solid black'}}>
            <div style={{ position: 'relative' }}>
                <span style={{ position: 'absolute', left: '12px', top: '50%', transform: 'translateY(-50%)', zIndex: 1, }}>
                    <svg width="1em" height="1em" viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                        <path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0 0 16 9.5a6.5 6.5 0 1 0-6.5 6.5c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z" />
                    </svg>
                </span>
                <input
                    id='searchInput'
                    value={searchValue}
                    onChange={e => setSearchValue(e.target.value)}
                    placeholder={t('search_placeholder')}
                    disabled={isLoading}
                    style={{
                        height: '30px',
                        width: '100%',
                        padding: '10px 10px 10px 40px',
                        border: '1px solid #d9d9d9',
                        borderRadius: '15px',
                        outline: 'none',
                        boxShadow: 'none'
                    }}
                />
            </div>
            {/* Muestra el indicador de carga */}
            {isLoading && searchValue.length > 0 && (
                <div className="absolute z-10 w-full bg-white border border-gray-200 rounded-md shadow-lg mt-1 p-2 text-center text-gray-500">
                    {t('searching_message') }
                </div>
            )}
            {/* Muestra el mensaje de error */}
            {error && (
                <div className="absolute z-10 w-full bg-red-100 border border-red-400 text-red-700 rounded-md shadow-lg mt-1 p-2">
                    {error}
                </div>
            )}
            {/* Renderiza SearchBox solo si hay resultados y no hay error/carga */}
            {!isLoading && !error && searchResults.length > 0 && (
                <SearchBox data={searchResults} word={searchValue} closeBox={closeBox} />
            )}
        </div>
    );
}
