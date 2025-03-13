import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
} from '@nextui-org/react';
import { MailOutlined, UserAddOutlined } from '@ant-design/icons';
import { Organization } from '../types/organization';

interface InviteUserModalProps {
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
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">
                            Invite User to {selectedOrganization?.name}
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody>
                                <Input
                                    label="Email Address"
                                    placeholder="email@example.com"
                                    value={inviteEmail}
                                    onChange={e => setInviteEmail(e.target.value)}
                                    startContent={<MailOutlined className="text-gray-400" />}
                                    type="email"
                                    autoFocus
                                    isRequired
                                />
                                {inviteError && <p className="text-danger text-sm mt-2">{inviteError}</p>}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    color="primary"
                                    isLoading={isInviting}
                                    startContent={<UserAddOutlined />}
                                >
                                    Send Invitation
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
