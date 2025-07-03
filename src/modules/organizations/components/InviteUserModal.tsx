import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from '@heroui/react';
import { Button, Input } from '@/components/ui';
import { MailOutlined, UserAddOutlined } from '@ant-design/icons';
import type { Organization } from '../types/organizations';
import { useTranslation } from 'react-i18next';

export interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOrganization: Organization | null;
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isInviting: boolean;
    inviteError: string;
}

export default function InviteUserModal({
    isOpen,
    onClose,
    selectedOrganization,
    inviteEmail,
    setInviteEmail,
    handleSubmit,
    isInviting,
    inviteError,
}: InviteUserModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            {t('invite_user_title')}{selectedOrganization?.name}
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody>
                                <div>
                                    <label htmlFor="email"> {t('email_label')}</label>
                                    <Input
                                        id="email"
                                        placeholder="email@example.com"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        startContent={<MailOutlined className="text-gray-400" />}
                                        type="email"
                                        autoFocus
                                        isRequired
                                    />
                                </div>
                                {inviteError && <p className="text-danger text-sm mt-2">{inviteError}</p>}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose}>
                                    {t('cancel_label')}
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={isInviting}
                                    startContent={<UserAddOutlined />}
                                >
                                    {t('send_button')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
