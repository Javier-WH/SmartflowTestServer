import React, { type ChangeEvent, useState, useContext, ReactNode, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import {
    CardBody,
    Card,
    CardFooter,
    Divider,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    DropdownTrigger,
    Button,
    useDisclosure,
} from '@heroui/react';
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    UserAddOutlined,
    LogoutOutlined,
    TeamOutlined,
    UserOutlined
} from '@ant-design/icons';
import type { Organization } from '../types/organizations';
import DeleteOrganizationModal from './DeleteOrganizationModal';
import EditOrganizationModal from './EditOrganizationModal';
import InviteUserModal from './InviteUserModal';
import LeaveOrganizationModal from './LeaveOrganizationModal';
import useOrganizations from '../hook/useOrganizations';
import useAuth from '@/modules/auth/hooks/useAuth';
import { MainContext, type MainContextValues } from '../../mainContext';
import type { UserRoll } from '../organizations';


interface OrganizationFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;
}



export default function OrganizationCard({ organization, userRolls }: { organization: Organization, userRolls?: UserRoll[] }) {
    const { memberRoll } = useContext<MainContextValues>(MainContext);
    const navigate = useNavigate();
    const { t } = useTranslation();
    // Modal states
    const { isOpen: isEditModalOpen, onOpen: onEditModalOpen, onClose: onEditModalClose } = useDisclosure();
    const { isOpen: isDeleteModalOpen, onOpen: onDeleteModalOpen, onClose: onDeleteModalClose } = useDisclosure();
    const { isOpen: isLeaveModalOpen, onOpen: onLeaveModalOpen, onClose: onLeaveModalClose } = useDisclosure();
    const { isOpen: isInviteModalOpen, onOpen: onInviteModalOpen, onClose: onInviteModalClose } = useDisclosure();

    const [formData, setFormData] = useState<OrganizationFormData>({
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
        updateOrganization,
        deleteOrganization,
        leaveOrganization,
        inviteUserToOrganization,
        mutate,
        deleteInvitation
    } = useOrganizations(user?.id);

    useEffect(() => {
        if (!userRolls || userRolls.length === 0) return;
        setInviteUserLevelId(userRolls[0].id);
    }, [userRolls]);



    // Handle card click to navigate to organization home
    const handleCardClick = (organizationSlug: string) => {
        localStorage.setItem('OrgName', organization.name || '');
        localStorage.setItem('OrgId', organization.id || '');
        navigate(`/${organizationSlug}/home`);
    };

    // Handle edit organization
    const handleEditOrganization = async (org: Organization) => {
        console.log(memberRoll);
        setFormData({ id: org.id, name: org.name || '', description: org.description || '' });
        onEditModalOpen();
    };

    // Handle delete organization
    const handleDeleteOrganization = () => {
        onDeleteModalOpen();
    };

    // Handle leave organization
    const handleLeaveOrganization = () => {
        onLeaveModalOpen();
    };

    // Handle invite users
    const handleInviteUsers = () => {
        setInviteEmail('');
        setInviteError('');
        onInviteModalOpen();
    };

    // Handle edit form submit
    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setFormError(t('organization_name_required'));
            return;
        }

        if (!formData.id) {
            setFormError(t("organnization_id_required"));
            return;
        }

        setIsSubmitting(true);
        setFormError('');

        try {
            const response = await updateOrganization(formData.id, {
                name: formData.name.trim(),
                description: formData.description.trim(),
            });

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Refresh organizations list
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

        if (!organization || !organization.id || !user?.id) return;

        setIsInviting(true);
        setInviteError('');

        try {
            const response = await inviteUserToOrganization(organization.id, inviteEmail.trim(), user.id, inviteUserLevelId);

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
        if (!organization || !organization.id) return;

        setIsSubmitting(true);

        try {
            const response = await deleteOrganization(organization.id);

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Refresh organizations list
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
        if (!organization || !organization.id || !user?.id) return;

        setIsSubmitting(true);

        try {
            const response = await leaveOrganization(organization.id, user.id);

            if (response.error) {
                setFormError(response.message);
                return;
            }

            // Optionally delete the invitation if it exists
            const invitationResponse = await deleteInvitation(organization.id, user.email || '');
            if (invitationResponse.error) {
                console.error('Error deleting invitation:', invitationResponse.message);
            }

            // Refresh organizations list
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

    const getLevelTitle = (organization: Organization): ReactNode => {

        if (organization.is_creator) {
            return <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                {t('creator_label')}
            </span>

        }
        else if (organization.leveltitle === "Admin") {
            return <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-full">
                {t('admin_label')}
            </span>
        }


        else if (organization.leveltitle === "Editor") {
            return <span className="text-xs bg-yellow-500/20 text-yellow-500 px-2 py-1 rounded-full">
                {t('editor_label')}
            </span>
        }

        else if (organization.leveltitle === "Lector") {
            return <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded-full">
                {t('lector_label')}
            </span>
        }
        else {
            return <span className="text-xs bg-pink-500/20 text-red-500 px-2 py-1 rounded-full">
                {t('unknown_label')}
            </span>
        }
    }

    return (
        <>
            <Card
                key={organization.id}
                isPressable
                isHoverable
                onClick={() => handleCardClick(organization.slug || '')}
                className="border-2 hover:border-primary transition-all duration-200"
            >
                <CardBody className="p-5">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="bg-primary/10 p-3 rounded-full">
                                <TeamOutlined style={{ fontSize: '24px', color: 'var(--heroui-colors-primary)' }} />
                            </div>
                            <div>
                                <h3 className="text-xl font-medium w-[270px]">{organization.name}</h3>

                                {getLevelTitle(organization)}
                            </div>
                        </div>

                        {/* Three dots menu */}
                        {(organization.is_creator || organization.is_member) && (
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
                                <DropdownMenu aria-label="Organization actions">

                                    {
                                        (organization.open || organization.is_creator) &&
                                        <DropdownItem
                                            key="leave-option"
                                            className="text-default-900 scale-120"

                                            startContent={<UserOutlined />}
                                            onPress={() => { navigate(`/${organization.slug}/members`) }}
                                        >
                                            {t("Members_label")}
                                        </DropdownItem>
                                    }


                                    {(organization.is_creator || organization.configure) && (
                                        <DropdownItem
                                            key="invite-option"
                                            startContent={<UserAddOutlined />}
                                            onPress={handleInviteUsers}
                                        >
                                            {t("invite_user_label")}
                                        </DropdownItem>
                                    )}

                                    {organization.is_creator && (
                                        <DropdownItem
                                            key="edit-option"
                                            startContent={<EditOutlined />}
                                            onPress={() => handleEditOrganization(organization)}
                                        >
                                            {t("edit_label")}
                                        </DropdownItem>
                                    )}

                                    {organization.is_creator && (
                                        <DropdownItem
                                            key="delete-option"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<DeleteOutlined />}
                                            onPress={handleDeleteOrganization}
                                        >
                                            {t("delete_label")}
                                        </DropdownItem>
                                    )}

                                    {organization.is_member && !organization.is_creator && (
                                        <DropdownItem
                                            key="leave-option"
                                            className="text-warning"
                                            color="warning"
                                            startContent={<LogoutOutlined />}
                                            onPress={handleLeaveOrganization}
                                        >
                                            {t("leave_organization_label")}
                                        </DropdownItem>
                                    )}

                                    {!organization.is_creator && !organization.is_member && (
                                        <DropdownItem key="no-actions-option" isDisabled>
                                            {t("no_actions_available_message")}
                                        </DropdownItem>
                                    )}
                                </DropdownMenu>
                            </Dropdown>
                        )}
                    </div>
                    {organization.description && (
                        <>
                            <Divider className="my-3" />
                            <p className="text-sm text-gray-600 line-clamp-2">{organization.description}</p>
                        </>
                    )}
                </CardBody>
                <CardFooter className="bg-default-50 border-t-1 p-3">
                    <p className="text-xs text-gray-500">{t("click_to_view_organization")}</p>
                </CardFooter>
            </Card>

            {/* Modals */}

            <EditOrganizationModal
                isOpen={isEditModalOpen}
                onClose={onEditModalClose}
                formData={formData}
                handleInputChange={handleInputChange}
                handleSubmit={handleEditSubmit}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <DeleteOrganizationModal
                isOpen={isDeleteModalOpen}
                onClose={onDeleteModalClose}
                selectedOrganization={organization}
                handleDeleteConfirm={handleDeleteConfirm}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <LeaveOrganizationModal
                isOpen={isLeaveModalOpen}
                onClose={onLeaveModalClose}
                selectedOrganization={organization}
                handleLeaveConfirm={handleLeaveConfirm}
                isSubmitting={isSubmitting}
                formError={formError}
            />

            <InviteUserModal
                isOpen={isInviteModalOpen}
                onClose={onInviteModalClose}
                selectedOrganization={organization}
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
