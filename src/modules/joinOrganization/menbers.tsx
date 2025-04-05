/* eslint-disable react-hooks/exhaustive-deps */
import useAuth from '../auth/hooks/useAuth';
import useOrganizations from '../organizations/hook/useOrganizations';
import { useNavigate, useParams } from 'react-router-dom';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import { useEffect, useState } from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@nextui-org/react';
import { message } from 'antd';
import { IoMdArrowRoundBack } from "react-icons/io";
import { ImUser } from "react-icons/im";
import { CiMenuKebab } from "react-icons/ci";
import EditMemberModal from './editMemberModal';
import DeleteMemberModal from './deleteMemberModal';
import InviteUserModal from '../organizations/components/InviteUserModal'


export interface Org {
  id: string;
  name: string;
  description: string;
  slug: string;
  user_id: string;
}

export interface Member {
  rollid: string;
  rollname: string;
  userid: string;
  useremail: string;
}

export interface MemberRoll {
  id: string;
  level: string;
  read: boolean
  write: boolean;
  delete: boolean;
}

export default function Menbers() {
  const { slug } = useParams();
  const { signOut, user } = useAuth();
  const navigate = useNavigate();
  const { getOrganizationMembers, getUserRolls, inviteUserToOrganization } = useOrganizations();
  const { getOrganizationBasicData } = useGetOrganizationData();
  const [organization, setOrganization] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(false);
  const [memberToEdit, setMemberToEdit] = useState<Member | null>(null);
  const [memberToDelete, setMemberToDelete] = useState<Member | null>(null);
  const [rolls, setRolls] = useState<MemberRoll[]>([]);

  const [inviteUserOpen, setInviteUserOpen] = useState(false);
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [isInviting, setIsInviting] = useState<boolean>(false);
  const [inviteError, setInviteError] = useState('');

  useEffect(() => {
    setLoading(!organization && !members);
  }, [organization, members]);

  useEffect(()=> {
    getUserRolls()
      .then(res => {
        if (res.error) {
          console.log(res.error);
          return;
        }
        setRolls(res.data as MemberRoll[]);
      })
      .catch(err => console.log(err));
  }, [])


  useEffect(() => {
    if (!slug) return;
    getOrganizationBasicData(slug)
      .then(res => {
        setOrganization(res.data[0]);
      })
      .catch(err => console.log(err));
  }, [slug]);


  useEffect(() => {
    if (!organization) return;
    getOrganizationMembers(organization.id)
      .then((res) => {
        if (res.error) {
          console.log(res.error);
          return;
        }
        setMembers(res.data as Member[]);
      })
      .catch(err => console.log(err));
  }, [organization, memberToEdit, memberToDelete]);


  useEffect(() => {
    if (!members) return;

    if (filter === '') {
      setFilteredMembers(members);
      return;
    }
    const filtered = members.filter((member) => member.useremail.toLowerCase().includes(filter.toLowerCase()));
    setFilteredMembers(filtered);
  }, [filter, members]);

  const cleanMembers = () => {
    setMemberToEdit(null);
  }

  const handleEditMember = (member: Member) => {

    if(organization?.user_id !== user?.id) {
      message.error('You are not the owner of this organization');
      return;
    }

    cleanMembers();
    setMemberToEdit(member);
 
  }

  const handleDeleteMember = (member: Member) => {
    if (organization?.user_id !== user?.id) {
      message.error('You are not the owner of this organization');
      return;
    }
    cleanMembers();
    setMemberToDelete(member);

  }



  const handleInviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    if (organization?.user_id !== user?.id) {
      message.error('You are not the owner of this organization');
      return;
    }

    if (!inviteEmail.trim()) {
      setInviteError('Email is required');
      return;
    }

    // Basic email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(inviteEmail.trim())) {
      setInviteError('Please enter a valid email address');
      return;
    }

    if (!organization || !organization.id || !user?.id) return;

    setIsInviting(true);
    setInviteError('');

    try {
      const response = await inviteUserToOrganization(organization.id, inviteEmail.trim(), user.id);

      if (response.error) {
        setInviteError(response.message);
        return;
      }

      // Clear form and close modal on success
      setInviteEmail('');
      handleCloseInviteModal();

      // Show success toast or notification here if you have a notification system
    } catch (error) {
      setInviteError('An unexpected error occurred');
      console.error(error);
    } finally {
      setIsInviting(false);
    }
  };


  const handleCloseInviteModal = () => {
    setInviteUserOpen(false);
    setInviteEmail('');
    setInviteError('');
  };


  return <>
    <InviteUserModal
      isOpen={inviteUserOpen}
      onClose={handleCloseInviteModal}
      selectedOrganization={organization}
      inviteEmail={inviteEmail}
      setInviteEmail={setInviteEmail}
      handleSubmit={handleInviteUser}
      isInviting={isInviting}
      inviteError={inviteError}
    />
    <EditMemberModal organization={organization}  rolls={rolls} member={memberToEdit} setMember={setMemberToEdit} key={memberToEdit?.userid || 'modal'} />
    <DeleteMemberModal organization={organization} member={memberToDelete} setMember={setMemberToDelete} key={memberToDelete?.userid || 'modal'} />
    <header className="w-full flex justify-between items-center px-8 bg-white py-4 fixed top-0">
      <Button color="primary" onClick={() => navigate(-1)}>
        <IoMdArrowRoundBack />
      </Button>
      <Button color="primary" onClick={signOut}>
        Close session
      </Button>
    </header>
    {
      loading 
      ? <div className="flex justify-center items-center h-screen">Loading...</div> 
      :<section className="py-8 max-w-7xl mx-auto mt-16">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">{organization?.name}</h1>
          <Button color="primary" onClick={() => setInviteUserOpen(true)}> Invite user</Button>
        </div>
        <Input
          className='max-w-[900px]'
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          label="Search members"
          placeholder="Search by email"
        />
        <div className="flex flex-col gap-1">
          {
            filteredMembers.map((member) => (
              <div key={member.userid}
                className="
                  flex items-center 
                  justify-between 
                  max-w-[900px]
                  border border-gray-100
                  rounded-xl
                  bg-white
                  shadow-sm
                  p-3"
              >
                <div className="flex items-center">
                  <ImUser className="w-10 h-10 rounded-full mr-4" />
                  <div>
                    <h2 className="text-lg font-semibold">{member.useremail}</h2>
                    <p className="text-gray-500">{member.rollname}</p>
                  </div>
                </div>
  
                <Dropdown>
                  <DropdownTrigger>
                    <Button
                      variant="light"
                      aria-label="Menú de opciones"
                    >
                      <CiMenuKebab />
                    </Button>
                  </DropdownTrigger>

                  <DropdownMenu
                    aria-label="Acciones del menú"
                    variant="light"
                  >
                    <DropdownItem key="edit" onClick={() => handleEditMember(member)}>Edit roll</DropdownItem>
                    <DropdownItem key="delete" onClick={() => handleDeleteMember(member)}>Delete member</DropdownItem>
                  </DropdownMenu>
                </Dropdown>
              </div>
            ))
          }
        </div>


      </section>
    }
  </>
}