import { Input } from '@/components/ui';
import { useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { IoSearchSharp } from 'react-icons/io5';
import useFilesManager from '../folderNavigator/hooks/useFileManager';
import type { SearchBoxInterface } from './types/searchBox';
import SearchBox from './searchBox/searchBox';
import { useTranslation } from 'react-i18next';

export default function SearchInput() {
    const [searchValue, setSearchValue] = useState('');
    const [searchResults, setSearchResults] = useState<SearchBoxInterface[]>([]);
    const { searchFiles } = useFilesManager();
    const { organization_id: slug } = useParams();
    const { t } = useTranslation();

    useEffect(() => {
        if (searchValue.length === 0 || searchValue === '' || !slug) {
            closeBox();
            return;
        }

        searchFiles(searchValue, slug)
            .then(res => setSearchResults(res.data))
            .catch(err => console.log(err));

        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [searchValue]);

    useEffect(() => {
        const keyEvent = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                closeBox();
            }
        };

        window.addEventListener('keydown', keyEvent);
        return () => {
            window.removeEventListener('keydown', keyEvent);
        };
    }, []);

    const closeBox = () => {
        setSearchResults([]);
        setSearchValue('');
    };

    return (
        <div style={{ width: '100%', position: 'relative' }}>
            <Input
                startContent={<IoSearchSharp />}
                value={searchValue}
                onChange={e => setSearchValue(e.target.value)}
                placeholder={t('search_placeholder')}
            />
            <SearchBox data={searchResults} word={searchValue} closeBox={closeBox} />
        </div>
    );
}
