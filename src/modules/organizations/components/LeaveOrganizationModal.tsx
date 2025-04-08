import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from '@nextui-org/react';
import type { Organization } from '../types/organizations';

interface LeaveOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOrganization: Organization | null;
    handleLeaveConfirm: () => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function LeaveOrganizationModal({
    isOpen,
    onClose,
    selectedOrganization,
    handleLeaveConfirm,
    isSubmitting,
    formError,
}: LeaveOrganizationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Leave Organization</ModalHeader>
                        <ModalBody>
                            <p>
                                Are you sure you want to leave <strong>{selectedOrganization?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                You will need to be invited again to rejoin this organization.
                            </p>
                            {formError && <p className="text-danger text-sm mt-2">{formError}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="warning" onPress={handleLeaveConfirm} isLoading={isSubmitting}>
                                Leave
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
