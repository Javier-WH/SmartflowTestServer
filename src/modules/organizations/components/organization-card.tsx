import { type ChangeEvent, useState } from 'react';
import { useNavigate } from 'react-router-dom';

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
} from "@heroui/react";
import {
    MoreOutlined,
    EditOutlined,
    DeleteOutlined,
    UserAddOutlined,
    LogoutOutlined,
    TeamOutlined,
} from '@ant-design/icons';
import type { Organization } from '../types/organizations';
import DeleteOrganizationModal from './DeleteOrganizationModal';
import EditOrganizationModal from './EditOrganizationModal';
import InviteUserModal from './InviteUserModal';
import LeaveOrganizationModal from './LeaveOrganizationModal';
import useOrganizations from '../hook/useOrganizations';
import useAuth from '@/modules/auth/hooks/useAuth';

interface OrganizationFormData {
    id?: string;
    name: string;
    description: string;
    slug?: string;
}

export default function OrganizationCard({ organization }: { organization: Organization }) {
    const navigate = useNavigate();

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

    const { user } = useAuth();
    const { updateOrganization, deleteOrganization, leaveOrganization, inviteUserToOrganization, mutate, deleteInvitation } =
        useOrganizations(user?.id);

    // Handle card click to navigate to organization home
    const handleCardClick = (organizationSlug: string) => {
        navigate(`/${organizationSlug}/home`);
    };

    // Handle edit organization
    const handleEditOrganization = (org: Organization, e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setFormData({ id: org.id, name: org.name || '', description: org.description || '' });
        onEditModalOpen();
    };

    // Handle delete organization
    const handleDeleteOrganization = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onDeleteModalOpen();
    };

    // Handle leave organization
    const handleLeaveOrganization = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        onLeaveModalOpen();
    };

    // Handle invite users
    const handleInviteUsers = (e: React.MouseEvent<HTMLElement>) => {
        e.stopPropagation();
        setInviteEmail('');
        setInviteError('');
        onInviteModalOpen();
    };

    // Handle edit form submit
    const handleEditSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!formData.name.trim()) {
            setFormError('Organization name is required');
            return;
        }

        if (!formData.id) {
            setFormError('Organization ID is missing');
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
            setFormError('An unexpected error occurred');
            console.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle invite submit
    const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

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
            onInviteModalClose();

            // Show success toast or notification here if you have a notification system
        } catch (error) {
            setInviteError('An unexpected error occurred');
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
            setFormError('An unexpected error occurred');
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
            setFormError('An unexpected error occurred');
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
                                <h3 className="text-xl font-medium">{organization.name}</h3>
                                {organization.is_creator && (
                                    <span className="text-xs bg-primary/20 text-primary px-2 py-1 rounded-full">
                                        Creator
                                    </span>
                                )}
                                {organization.is_member && !organization.is_creator && (
                                    <span className="text-xs bg-success/20 text-success px-2 py-1 rounded-full">
                                        Member
                                    </span>
                                )}
                            </div>
                        </div>

                        {/* Three dots menu */}
                        {(organization.is_creator || organization.is_member) && (
                            <Dropdown>
                                <DropdownTrigger>
                                    <Button
                                        isIconOnly
                                        variant="light"
                                        className="text-default-400"
                                        radius="full"
                                        size="sm"
                                        onClick={e => e.stopPropagation()}
                                    >
                                        <MoreOutlined />
                                    </Button>
                                </DropdownTrigger>
                                <DropdownMenu aria-label="Organization actions">
                                    {organization.is_creator && (
                                        <DropdownItem
                                            key="invite-option"
                                            startContent={<UserAddOutlined />}
                                            onClick={(e: React.MouseEvent<HTMLElement>) => handleInviteUsers(e)}
                                        >
                                            Invite Users
                                        </DropdownItem>
                                    )}

                                    {organization.is_creator && (
                                        <DropdownItem
                                            key="edit-option"
                                            startContent={<EditOutlined />}
                                            onClick={(e: React.MouseEvent<HTMLElement>) =>
                                                handleEditOrganization(organization, e)
                                            }
                                        >
                                            Edit
                                        </DropdownItem>
                                    )}

                                    {organization.is_creator && (
                                        <DropdownItem
                                            key="delete-option"
                                            className="text-danger"
                                            color="danger"
                                            startContent={<DeleteOutlined />}
                                            onClick={(e: React.MouseEvent<HTMLElement>) => handleDeleteOrganization(e)}
                                        >
                                            Delete
                                        </DropdownItem>
                                    )}

                                    {organization.is_member && !organization.is_creator && (
                                        <DropdownItem
                                            key="leave-option"
                                            className="text-warning"
                                            color="warning"
                                            startContent={<LogoutOutlined />}
                                            onClick={(e: React.MouseEvent<HTMLElement>) => handleLeaveOrganization(e)}
                                        >
                                            Leave Organization
                                        </DropdownItem>
                                    )}

                                    {!organization.is_creator && !organization.is_member && (
                                        <DropdownItem key="no-actions-option" isDisabled>
                                            No actions available
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
                    <p className="text-xs text-gray-500">Click to view organization</p>
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
                isInviting={isInviting}
                inviteError={inviteError}
            />
        </>
    );
}
