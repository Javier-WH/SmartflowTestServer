import { Input, MenuProps, message } from 'antd';
import useAuth from '@/modules/auth/hooks/useAuth';
import { IoSearchSharp } from "react-icons/io5";
import Logo from '../../assets/svg/logo.svg';
import UserPlaceHolder from '../../assets/svg/userPlaceHolder.svg'
import { CaretDownOutlined } from '@ant-design/icons';
import { Dropdown } from 'antd';
import './navBar.css';

export default function NavBar() {
  const { signOut } = useAuth();

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
      onClick: () => message.info('Click on Create folder'),
    },
    {
      label: 'Create link',
      key: '2',
      onClick: () => message.info('Click on Create link'),
    },
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



  //bg-gray-900 text-white w-full p-4 flex items-center justify-between"
  return <header className="navbar-container">

    <div className="title-container">
      <div className="logo-container">
        <img src={Logo} alt="" />
        <Input suffix={<IoSearchSharp />} size='large' />
      </div>
      <div className="navbar-title">Kepen</div>
    </div>

    <Dropdown menu={{ items: userMenu }} trigger={['click']}>
      <button className="btn-user-container">
        <img src={UserPlaceHolder} alt="" />
      </button>
    </Dropdown>

    <div className='navbar-buttons'>
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
          onClick={() => message.info('Click on Create page')}
          trigger={['click']}
          style={{ direction: 'ltr' }}
        >
          <span>Create page</span>
        </Dropdown.Button>
      </div>


    </div>

  </header>

}