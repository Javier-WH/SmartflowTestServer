import { type MenuProps, message, Button } from 'antd';
import useAuth from '@/modules/auth/hooks/useAuth';
import Logo from '../../assets/svg/logo.svg';
import UserPlaceHolder from '../../assets/svg/userPlaceHolder.svg';
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { MainContext, type MainContextValues } from '../mainContext';
import useFilesManager from '../folderNavigator/hooks/useFileManager';
import SearchInput from '../search/searchInput';
import './navBar.css';
import { useContext, useEffect, useState } from 'react';
import useGetOrganizationData from './hooks/useOrganizationData';

import type { Folder } from '../folderNavigator/types/folder';

export default function NavBar() {
    const { signOut } = useAuth();
    const navigate = useNavigate();
    const { inPage, setNewFolderRequest } = useContext(MainContext) as MainContextValues;
    const { createFile } = useFilesManager();
    const { organization_id: slug } = useParams();
    const {getOrganizationBasicData} = useGetOrganizationData();
    const [organizationName, setOrganizationName] = useState<string>('');

    //get organization name
    useEffect(() => {
        if (!slug) return;
        getOrganizationBasicData(slug)
        .then(res => {
            setOrganizationName(res?.data[0]?.name ?? 'Unknown');
        })
        .catch(err => console.log(err));
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [slug])

    const userMenu: MenuProps['items'] = [
        {
            key: '1',
            label: 'Organizations',
            onClick: () => navigate('/organizations'),
        },
        {
            key: '2',
            label: 'Members',
            onClick: () => navigate(`/members/${slug}`),
        },
        // {
        //   key: '2',
        //   label: "Billing",
        //   onClick: () => message.info('Click on Billing'),
        // },
        {
            key: '3',
            label: 'Logout',
            onClick: signOut,
        },
    ];

    const createMenu: MenuProps['items'] = [
        {
            label: 'Create folder',
            key: '1',
            onClick: () => handleCreateFolder(),
        },
    ];



    const handleCreatePage = () => {
        if (!slug) {
            message.error('Cant find organization');
            return
        }
        createFile('untitled', null, slug).then(res => {
            if (res.error) {
                message.error('Error creating page');
                return;
            }
            const id = res.data;
            const pageType = import.meta.env.VITE_PAGE_TYPE;
            if (pageType === 'quill') {
                navigate(`/textEditor/${id}`);
            } else {
                navigate(`/page/${id}`);
            }
        });
    };

    const handleCreateFolder = () => {
        const newFolder: Folder = {
            name: '',
            container: '7a89a4e6-b484-4a5b-bf94-5277cb45ae9x',
        };
        setNewFolderRequest(newFolder);
    };

    return (
        <header className={`navbar-container ${inPage && 'navbar-page-size'}`}>
            <Dropdown menu={{ items: userMenu }} trigger={['click']}>
                <Button className="btn-user-container py-4">
                    <img src={UserPlaceHolder} alt="" />
                </Button>
            </Dropdown>

            <div className="title-container">
                <div
                    className="logo-container"
                    style={{ display: 'flex', alignItems: 'center', width: '100%', maxWidth: '600px', gap: '10px' }}
                >
                    <Link to="/home">
                        <img src={Logo} alt="" />
                    </Link>
                    <SearchInput />
                </div>
            </div>

            {!inPage ? (
                <div className="flex justify-between items-center navbar-buttons px-8 py-2 mt-10">
                    {!inPage && <div className="navbar-title">{organizationName}</div>}

                    <div className="create-container">
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
            ) : (
                <div className="page-bar-container">
                    <button className="page-bar-publish-button">Publish</button>
                </div>
            )}
        </header>
    );
}
