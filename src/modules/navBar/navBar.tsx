import { MenuProps, message } from 'antd';
import useAuth from '@/modules/auth/hooks/useAuth';
import Logo from '../../assets/svg/logo.svg';
import UserPlaceHolder from '../../assets/svg/userPlaceHolder.svg'
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { Link, useNavigate } from 'react-router-dom';
import { MainContext, MainContextValues } from '../mainContext';
import useFilesManager from '../folderNavigator/hooks/useFileManager';
import SearchInput from '../search/searchInput';

import './navBar.css';
import { useContext } from 'react';
import { Folder } from '../folderNavigator/types/folder';

export default function NavBar() {
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { inPage, setNewFolderRequest} = useContext(MainContext) as MainContextValues
  const { createFile } = useFilesManager();


  const userMenu: MenuProps['items'] = [
    {
      key: '1',
      label: "Team menbers",
      onClick: () => message.info('Click on Team menbers'),
    },
    {
      key: '2',
      label: "Billing",
      onClick: () => message.info('Click on Billing'),
    },
    {
      key: '3',
      label: "Logout",
      onClick: signOut,
    }
  ];

  const createMenu: MenuProps['items'] = [
    {
      label: 'Create folder',
      key: '1',
      onClick: () => handleCreateFolder(),
    }
  ];


  const beowseMenu: MenuProps['items'] = [
    {
      label: 'Browse',
      key: '1',
      onClick: () => message.info('Click on Browse'),
    },
    {
      label: 'Manage',
      key: '2',
      onClick: () => message.info('Click on Manage'),
    },
    {
      label: 'Share',
      key: '3',
      onClick: () => message.info('Click on Share'),
    }
  ];



  const handleCreatePage = () => {
    createFile('untitled')
    .then((res) => {
      if (res.error) {
        message.error('Error creating page')
       return
      }
      const id = res.data
      const pageType = import.meta.env.VITE_PAGE_TYPE;
      if (pageType === 'quill') {
        navigate(`/textEditor/${id}`);
      }else{
        navigate(`/page/${id}`)
      }
    })
  }

  const handleCreateFolder =() => {
    const newFolder: Folder = {
      name: '',
      container: '7a89a4e6-b484-4a5b-bf94-5277cb45ae9x'
    }
    setNewFolderRequest(newFolder)
  }



  return <header className={`navbar-container ${inPage && 'navbar-page-size'}`}>
    <Dropdown menu={{ items: userMenu }} trigger={['click']}>
      <button className="btn-user-container">
        <img src={UserPlaceHolder} alt="" />
      </button>
    </Dropdown>


    <div className="title-container">
      <div className="logo-container" style={{display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px', gap: '10px'}}>
        <Link to='/home' >
          <img src={Logo} alt="" />
        </Link>
        <SearchInput />
      </div>
      {!inPage && <div className="navbar-title">Kepen</div>}
    </div>

    {
      !inPage
        ? <div className='navbar-buttons'>
          <div className='brouse-container'>
            <Dropdown menu={{ items: beowseMenu }} trigger={['click']}>
              <a onClick={(e) => e.preventDefault()}>
                Brouse
                <CaretDownOutlined />
              </a>
            </Dropdown>
          </div>

          <div className='create-container'>

            <Dropdown.Button
              icon={<CaretDownOutlined />}
              menu={{ items: createMenu }}
              onClick={handleCreatePage}
              trigger={['click']}
              style={{ direction: 'ltr' }}
            >
              <span>Create page</span>
            </Dropdown.Button>
          </div>
        </div>
        : <div className='page-bar-container'>
          <button className='page-bar-publish-button'>Publish</button>
        </div>

    }


  </header>

}
