import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import type { WorkingGroup } from '../types/working_group';

interface DeleteWorkingGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedWorkingGroup: WorkingGroup | null;
    handleDeleteConfirm: () => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function DeleteWorkingGroupModal({
    isOpen,
    onClose,
    selectedWorkingGroup,
    handleDeleteConfirm,
    isSubmitting,
    formError,
}: DeleteWorkingGroupModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('delete_working_group_title')}</ModalHeader>
                        <ModalBody>
                            <p>
                                {t('delete_working_group_message')} <strong>{selectedWorkingGroup?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">{t('this_action_cannot_be_undone_message')}</p>
                            {formError && <p className="text-danger text-sm mt-2">{formError}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                {t('cancel_label')}
                            </Button>
                            <Button color="danger" onPress={handleDeleteConfirm} isLoading={isSubmitting}>
                                {t('delete_label')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
