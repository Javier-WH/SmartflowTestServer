/* eslint-disable react-hooks/exhaustive-deps */
import useAuth from '../auth/hooks/useAuth';
import useOrganizations from '../organizations/hook/useOrganizations';
import { useNavigate, useParams } from 'react-router-dom';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import { useEffect, useState, useContext } from 'react';
import { Button, Input, Dropdown, DropdownTrigger, DropdownMenu, DropdownItem } from '@heroui/react';
import { message } from 'antd';
//import { IoMdArrowRoundBack } from 'react-icons/io';
import { ImUser } from 'react-icons/im';
import { CiMenuKebab } from 'react-icons/ci';
import EditMemberModal from './editMemberModal';
import DeleteMemberModal from './deleteMemberModal';
import InviteUserModal from '../organizations/components/InviteUserModal';
import { MainContext, MainContextValues } from '../mainContext';
import { useTranslation } from 'react-i18next';
import { FiSearch, FiUsers } from 'react-icons/fi';
import Boton from '@/components/ui/Boton';


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
    const [inviteUserLevelId, setInviteUserLevelId] = useState('');
    const { t } = useTranslation();

    useEffect(() => {
        if (!rolls || rolls.length === 0) return;
        setInviteUserLevelId(rolls[rolls.length - 1].id);
    }, [rolls]);

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
                userRolls={rolls}
                setInviteUserLevelId={setInviteUserLevelId}
                inviteUserLevelId={inviteUserLevelId}
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



            {loading ? (
                <div className="flex justify-center items-center h-screen">Loading...</div>
            ) : (
                <section className="py-8 max-w-4xl mx-auto mt-16 px-4">
                    <div className="flex justify-between items-center mb-8">
                        <div className="flex items-center cursor-pointer hover:bg-gray-100 p-2 rounded-[15px]" onClick={() => navigate(`/${organization_id}/home`)}>
                            <div className="p-3 bg-gray-100 rounded-[15px] mr-3">
                                <FiUsers className="text-gray-600 text-xl" />
                            </div>
                            <h1 className="text-2xl font-semibold text-gray-800 " >{organization?.name}</h1>
                        </div>
                        {(organization?.user_id === user?.id || memberRoll?.invite) && (

                                <Boton text={t('invite_member_label')} onClick={() => setInviteUserOpen(true)}/>
                    
                        )}
                    </div>

                    <div className="relative mb-8">
                        <FiSearch className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 z-10" />
                        <Input
                            className="rounded-[15px] pl-12 border-gray-300 focus:border-primary transition-colors"
                            value={filter}
                            onChange={e => setFilter(e.target.value)}
                            placeholder={t('search_by_email_placeholder')}
                        />
                    </div>

                    <div className="bg-white rounded-[15px] shadow-sm border border-gray-200 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50 flex items-center justify-between">
                            <h2 className="font-medium text-gray-700">{t('members_list_heading')}</h2>
                            <h5 className="text-sm text-gray-500">{`${t("total_members")}: ${filteredMembers.length}`}</h5>
                        </div>

                        <div className="divide-y divide-gray-100">
                            {filteredMembers.length > 0 ? (
                                filteredMembers.map(member => (
                                    <div
                                        key={member.userid}
                                        className="flex items-center justify-between p-5 hover:bg-gray-50 transition-colors"
                                    >
                                        <div className="flex items-center">
                                            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center mr-4">
                                                <ImUser className="text-gray-600" />
                                            </div>
                                            <div>
                                                <h2 className="text-lg font-medium text-gray-800">{member.useremail}</h2>
                                                <p className="text-gray-500 text-sm">{member.rollname}</p>
                                            </div>
                                        </div>

                                        <Dropdown>
                                            <DropdownTrigger>
                                                <Button
                                                    variant="light"
                                                    aria-label="Menú de opciones"
                                                    className="rounded-[15px] text-gray-500 hover:bg-gray-100"
                                                >
                                                    <CiMenuKebab className="text-lg" />
                                                </Button>
                                            </DropdownTrigger>

                                            <DropdownMenu
                                                aria-label="Acciones del menú"
                                                variant="flat"
                                                className="rounded-[15px] p-2"
                                            >
                                                <DropdownItem
                                                    key="edit"
                                                    onPress={() => handleEditMember(member)}
                                                    className="rounded-[10px] px-3 py-2 data-[hover=true]:bg-gray-100"
                                                >
                                                    {t('edit_rolle_label')}
                                                </DropdownItem>
                                                <DropdownItem
                                                    key="delete"
                                                    onPress={() => handleDeleteMember(member)}
                                                    className="rounded-[10px] px-3 py-2 data-[hover=true]:bg-gray-100 text-danger"
                                                >
                                                    {t('delete_member_label')}
                                                </DropdownItem>
                                            </DropdownMenu>
                                        </Dropdown>
                                    </div>
                                ))
                            ) : (
                                <div className="py-12 text-center">
                                    <div className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4">
                                        <FiUsers className="text-gray-400 text-xl" />
                                    </div>
                                    <p className="text-gray-500">{t('no_members_found')}</p>
                                </div>
                            )}
                        </div>
                    </div>
                </section>
            )}
        </>
    );
}