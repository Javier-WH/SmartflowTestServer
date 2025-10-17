import {
    DeleteOutlined,
    EditOutlined,
    LogoutOutlined,
    MoreOutlined,
    TeamOutlined,
    UserAddOutlined,
    UserOutlined,
} from '@ant-design/icons';
import {
    Button,
    Card,
    CardBody,
    CardFooter,
    Divider,
    Dropdown,
    DropdownItem,
    DropdownMenu,
    DropdownTrigger,
    useDisclosure,
} from '@heroui/react';
import { type ChangeEvent, type ReactNode, useContext, useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import useAuth from '@/modules/auth/hooks/useAuth';
import { MainContext, type MainContextValues } from '../../mainContext';
import useWorkingGroup from '../hook/useWorkingGroup';
import type { WorkingGroup } from '../types/working_group';
import type { UserRoll } from '../working_group';
import DeleteWorkingGroupModal from './DeleteWorkingGroupModal';
import EditWorkingGroupModal from './EditWorkingGroupModal';
import InviteUserModal from './InviteUserModal';
import LeaveWorkingGroupModal from './LeaveWorkingGroupModal';

interface WorkingGroupFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;
}

export default function WorkingGroupCard({
    workingGroup,
    userRolls,
}: {
    workingGroup: WorkingGroup;
    userRolls?: UserRoll[];
}) {
    const { memberRoll } = useContext<MainContextValues>(MainContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    // Modal states
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isLeaveModalOpen, onOpen: onLeaveModalOpen, onClose: onLeaveModalClose } = useDisclosure();
    const { isOpen: isInviteModalOpen, onOpen: onInviteModalOpen, onClose: onInviteModalClose } = useDisclosure();

    const [formData, setFormData] = useState<WorkingGroupFormData>({
        name: '',
        description: '',
    });
    const [formError, setFormError] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Invitation form state
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteError, setInviteError] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    const [inviteUserLevelId, setInviteUserLevelId] = useState('');
    const { user } = useAuth();
    const {
        updateWorkingGroup,
        deleteWorkingGroup,
        leaveWorkingGroup,
        inviteUserToWorkingGroup,
        mutate,
        deleteInvitation,
    } = useWorkingGroup(user?.id);

    useEffect(() => {
        if (!userRolls || userRolls.length === 0) return;
        setInviteUserLevelId(userRolls[0].id);
    }, [userRolls]);

    const handleCardClick = (workingGroupSlug: string) => {
        localStorage.setItem('OrgName', workingGroup.name || '');
        localStorage.setItem('OrgId', workingGroup.id || '');
        navigate(`/${workingGroupSlug}/home`);
    };

    const handleEditWorkingGroup = async (org: WorkingGroup) => {
        setFormData({ id: org.id, name: org.name || '', description: org.description || '' });
        onEditModalOpen();
    };

    const handleDeleteWorkingGroup = () => {
        onDeleteModalOpen();
    };

    const handleLeaveWorkingGroup = () => {
        onLeaveModalOpen();
    };

    const handleInviteUsers = () => {
        setInviteEmail('');
        setInviteError('');
        onInviteModalOpen();
    };

    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setFormError(t('working_group_name_required'));
            return;
        }

        if (!formData.id) {
            setFormError(t('working_group_id_required'));
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            const response = await updateWorkingGroup(formData.id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
            });

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Refresh working_group list
            mutate();
            onEditModalClose();
        } catch (error) {
            setFormError(t('unexpected_error_message'));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle invite submit
    const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!inviteUserLevelId || inviteUserLevelId.trim() === '') {
            setInviteError(t('select_role_message'));
            return;
        }

        if (!inviteEmail.trim()) {
            setInviteError(t('enter_email_message'));
            return;
        }

        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail.trim())) {
            setInviteError(t('enter_valid_email_message'));
            return;
        }

        if (!workingGroup || !workingGroup.id || !user?.id) return;

        setIsInviting(true);
        setInviteError('');

        try {
            const response = await inviteUserToWorkingGroup(
                workingGroup.id,
                inviteEmail.trim(),
                user.id,
                inviteUserLevelId,
            );

            if (response.error) {
                setInviteError(response.message);
                return;
            }

            // Clear form and close modal on success
            setInviteEmail('');
            onInviteModalClose();

            // Show success toast or notification here if you have a notification system
        } catch (error) {
            setInviteError(t('unexpected_error_message'));
            console.error(error);
        } finally {
            setIsInviting(false);
        }
    };

    // Handle delete confirm
    const handleDeleteConfirm = async () => {
        if (!workingGroup || !workingGroup.id) return;

        setIsSubmitting(true);

        try {
            const response = await deleteWorkingGroup(workingGroup.id);

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Refresh working_group list
            mutate();
            onDeleteModalClose();
        } catch (error) {
            setFormError(t('unexpected_error_message'));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle leave confirm
    const handleLeaveConfirm = async () => {
        if (!workingGroup || !workingGroup.id || !user?.id) return;

        setIsSubmitting(true);

        try {
            const response = await leaveWorkingGroup(workingGroup.id, user.id);

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Optionally delete the invitation if it exists
            const invitationResponse = await deleteInvitation(workingGroup.id, user.email || '');
            if (invitationResponse.error) {
                console.error('Error deleting invitation:', invitationResponse.message);
            }

            // Refresh working_group list
            mutate();
            onLeaveModalClose();
        } catch (error) {
            setFormError(t('unexpected_error_message'));
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleInputChange = (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value,
        }));
    };

    const getLevelTitle = (working_group: WorkingGroup): ReactNode => {
        if (working_group.is_creator) {
            return (
                <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">{t('creator_label')}</span>
            );
        } else if (working_group.leveltitle === 'Admin') {
            return (
                <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                    {t('admin_label')}
                </span>
            );
        } else if (working_group.leveltitle === 'Editor') {
            return (
                <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                    {t('editor_label')}
                </span>
            );
        } else if (working_group.leveltitle === 'Lector') {
            return (
                <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full">{t('lector_label')}</span>
            );
        } else {
            return (
                <span className="text-xs bg-pink-500/20 text-red-500 px-2 py-1 rounded-full">{t('unknown_label')}</span>
            );
        }
    };

    return (
        <>
            <Card
                key={workingGroup.id}
                isPressable
                isHoverable
                onClick={() => handleCardClick(workingGroup.slug || '')}
                className="border-2 hover:border-primary transition-all duration-200"
            >
                <CardBody className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <TeamOutlined style={{ fontSize: '24px', color: 'var(--heroui-colors-primary)' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium w-[270px]">{workingGroup.name}</h3>

                                {getLevelTitle(workingGroup)}
                            </div>
                        </div>

                        {/* Three dots menu */}
                        {(workingGroup.is_creator || workingGroup.is_member) && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        className="text-default-900 scale-120"
                                        radius="full"
                                        size="lg"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <MoreOutlined />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Working Group actions">
                                    {workingGroup.id !== 'f47ac10b-58cc-4372-a567-0e02b2c3d479' && (
                                        <DropdownItem
                                            key="leave-option"
                                            className="text-default-900 scale-120"
                                            startContent={<UserOutlined />}
                                            onPress={() => {
                                                navigate(`/${workingGroup.slug}/members`);
                                            }}
                                        >
                                            {t('Members_label')}
                                        </DropdownItem>
                                    )}

                                    {(workingGroup.is_creator || workingGroup.configure) && (
                                        <DropdownItem
                                            key="invite-option"
                                            startContent={<UserAddOutlined />}
                                            onPress={handleInviteUsers}
                                        >
                                            {t('invite_user_label')}
                                        </DropdownItem>
                                    )}

                                    {workingGroup.is_creator && (
                                        <DropdownItem
                                            key="edit-option"
                                            startContent={<EditOutlined />}
                                            onPress={() => handleEditWorkingGroup(workingGroup)}
                                        >
                                            {t('edit_label')}
                                        </DropdownItem>
                                    )}

                                    {workingGroup.is_creator && (
                                        <DropdownItem
                                            key="delete-option"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<DeleteOutlined />}
                                            onPress={handleDeleteWorkingGroup}
                                        >
                                            {t('delete_label')}
                                        </DropdownItem>
                                    )}

                                    {workingGroup.is_member && !workingGroup.is_creator && (
                                        <DropdownItem
                                            key="leave-option"
                                            className="text-warning"
                                            color="warning"
                                            startContent={<LogoutOutlined />}
                                            onPress={handleLeaveWorkingGroup}
                                        >
                                            {t('leave_working_group_label')}
                                        </DropdownItem>
                                    )}

                                    {!workingGroup.is_creator && !workingGroup.is_member && (
                                        <DropdownItem key="no-actions-option" isDisabled>
                                            {t('no_actions_available_message')}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    {workingGroup.description && (
                        <>
                            <Divider className="my-3" />
                            <p className="text-sm text-gray-600 line-clamp-2">{workingGroup.description}</p>
                        </>
                    )}
                </CardBody>
                <CardFooter className="bg-default-50 border-t-1 p-3">
                    <p className="text-xs text-gray-500">{t('click_to_view_working_group')}</p>
                </CardFooter>
            </Card>

            {/* Modals */}

            <EditWorkingGroupModal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleEditSubmit}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <DeleteWorkingGroupModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                selectedWorkingGroup={workingGroup}
                handleDeleteConfirm={handleDeleteConfirm}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <LeaveWorkingGroupModal
                isOpen={isLeaveModalOpen}
                onClose={onLeaveModalClose}
                selectedWorkingGroup={workingGroup}
                handleLeaveConfirm={handleLeaveConfirm}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={onInviteModalClose}
                selectedWorkingGroup={workingGroup}
                inviteEmail={inviteEmail}
                setInviteEmail={setInviteEmail}
                handleSubmit={handleInviteSubmit}
                setInviteUserLevelId={setInviteUserLevelId}
                userRolls={userRolls}
                inviteUserLevelId={inviteUserLevelId}
                isInviting={isInviting}
                inviteError={inviteError}
            />
        </>
    );
}
