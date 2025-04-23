import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Button } from "@heroui/react";
import type { Organization } from '../types/organizations';

interface DeleteOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedOrganization: Organization | null;
    handleDeleteConfirm: () => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function DeleteOrganizationModal({
    isOpen,
    onClose,
    selectedOrganization,
    handleDeleteConfirm,
    isSubmitting,
    formError,
}: DeleteOrganizationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Delete Organization</ModalHeader>
                        <ModalBody>
                            <p>
                                Are you sure you want to delete <strong>{selectedOrganization?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">This action cannot be undone.</p>
                            {formError && <p className="text-danger text-sm mt-2">{formError}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                Cancel
                            </Button>
                            <Button color="danger" onPress={handleDeleteConfirm} isLoading={isSubmitting}>
                                Delete
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
