import { Input } from 'antd';
import { useEffect, useState } from 'react';
import { IoSearchSharp } from "react-icons/io5";
import useFilesManager from '../folderNavigator/hooks/useFileManager';
import type { SearchBoxInterface } from './types/searchBox';
import SearchBox from './searchBox/searchBox';

export default function SearchInput() {

  const [searchValue, setSearchValue] = useState('')
  const [searchResults, setSearchResults] = useState<SearchBoxInterface[]>([])
  const { searchFiles } = useFilesManager()

  useEffect(() => {
    if (searchValue.length === 0 || searchValue === '') {
      setSearchResults([])
      return
    }

    searchFiles(searchValue)
    .then(res => setSearchResults(res.data))
    .catch(err => console.log(err))

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchValue])


  return <div style={{ width: '100%', position: 'relative'}}>
    <Input
    suffix={<IoSearchSharp />} 
    size='large' 
    value={searchValue} 
    onChange={(e) => setSearchValue(e.target.value)}
    />
    <SearchBox data={searchResults} word={searchValue}/>
  </div>

}