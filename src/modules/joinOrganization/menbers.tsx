/* eslint-disable react-hooks/exhaustive-deps */
import useAuth from '../auth/hooks/useAuth';
import useOrganizations from '../organizations/hook/useOrganizations';
import { useNavigate, useParams } from 'react-router-dom';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import { useEffect, useState, useContext } from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { message } from 'antd';
import { IoMdArrowRoundBack } from 'react-icons/io';
import { ImUser } from 'react-icons/im';
import { CiMenuKebab } from 'react-icons/ci';
import EditMemberModal from './editMemberModal';
import DeleteMemberModal from './deleteMemberModal';
import InviteUserModal from '../organizations/components/InviteUserModal';
import { MainContext, MainContextValues } from '../mainContext';
import { useTranslation } from 'react-i18next';

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
    read: boolean;
    write: boolean;
    delete: boolean;
    invite: boolean;
    configure: boolean;
}

export default function Menbers() {
    const { memberRoll } = useContext(MainContext) as MainContextValues;
    const { organization_id } = useParams();
    const { user } = useAuth();
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
    const { t } = useTranslation();
    useEffect(() => {
        setLoading(!organization && !members);
    }, [organization, members]);

    useEffect(() => {
        getUserRolls()
            .then(res => {
                if (res.error) {
                    console.log(res.error);
                    return;
                }
                setRolls(res.data as MemberRoll[]);
            })
            .catch(err => console.log(err));
    }, []);

    useEffect(() => {
        if (!organization_id) return;
        getOrganizationBasicData(organization_id)
            .then(res => {
                setOrganization(res.data[0]);
            })
            .catch(err => console.log(err));
    }, [organization_id]);

    useEffect(() => {
        if (!organization) return;
        getOrganizationMembers(organization.id)
            .then(res => {
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
        const filtered = members.filter(member => member.useremail.toLowerCase().includes(filter.toLowerCase()));
        setFilteredMembers(filtered);
    }, [filter, members]);

    const cleanMembers = () => {
        setMemberToEdit(null);
    };

    const handleEditMember = (member: Member) => {
        if (organization?.user_id !== user?.id && !memberRoll?.invite) {
            message.error(t('can_not_invite_member_message'));
            return;
        }

        cleanMembers();
        setMemberToEdit(member);
    };

    const handleDeleteMember = (member: Member) => {
        if (organization?.user_id === member.userid) {
            message.error(t('can_not_invite_yourself_message'));
            return;
        }
        if (organization?.user_id !== user?.id && !memberRoll?.invite) {
            message.error(t('can_not_invite_member_message'));
            return;
        }
        cleanMembers();
        setMemberToDelete(member);
    };

    const handleInviteUser = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (organization?.user_id !== user?.id && !memberRoll?.invite) {
            message.error(t('can_not_invite_member_message'));
            return;
        }

        if (!inviteEmail.trim()) {
            setInviteError(t('email_required_message'));
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail.trim())) {
            setInviteError(t('enter_valid_email_message'));
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
            setInviteError(t('unexpected_error_message'));
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

    return (
        <>
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
            <EditMemberModal
                organization={organization}
                rolls={rolls}
                member={memberToEdit}
                setMember={setMemberToEdit}
                key={memberToEdit?.userid || 'modal'}
            />
            <DeleteMemberModal
                organization={organization}
                member={memberToDelete}
                setMember={setMemberToDelete}
                key={memberToDelete?.userid || 'modal'}
            />
            <header className="w-full flex justify-between items-center px-8 bg-white py-4 fixed top-0">
                <Button color="primary" onClick={() => navigate(-1)}>
                    <IoMdArrowRoundBack />
                </Button>
            </header>
            {loading ? (
                <div className="flex justify-center items-center h-screen">Loading...</div>
            ) : (
                <section className="py-8 max-w-7xl mx-auto mt-16">
                    <div className="flex justify-between items-center mb-8">
                        <h1 className="text-2xl font-semibold">{organization?.name}</h1>
                        {(organization?.user_id === user?.id || memberRoll?.invite) && (
                            <Button
                                color="primary"
                                onClick={() => {
                                    setInviteUserOpen(true);
                                }}
                            >
                                {' '}
                                {t('invite_member_label')}
                            </Button>
                        )}
                    </div>
                    <Input
                        className="max-w-[900px]"
                        value={filter}
                        onChange={e => setFilter(e.target.value)}
                        label={t('search_members_placeholder')}
                            placeholder={t('search_by_email_placeholder')}
                    />
                    <div className="flex flex-col gap-1">
                        {filteredMembers.map(member => (
                            <div
                                key={member.userid}
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
                                        <Button variant="light" aria-label="Menú de opciones">
                                            <CiMenuKebab />
                                        </Button>
                                    </DropdownTrigger>

                                    <DropdownMenu aria-label="Acciones del menú" variant="light">
                                        <DropdownItem key="edit" onClick={() => handleEditMember(member)}>
                                            {t('edit_rolle_label')}
                                        </DropdownItem>
                                        <DropdownItem key="delete" onClick={() => handleDeleteMember(member)}>
                                            {t('delete_member_label')}
                                        </DropdownItem>
                                    </DropdownMenu>
                                </Dropdown>
                            </div>
                        ))}
                    </div>
                </section>
            )}
        </>
    );
}
