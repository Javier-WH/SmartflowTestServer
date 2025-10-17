import { Button, Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import type { WorkingGroup } from '../types/working_group';

interface LeaveWorkingGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedWorkingGroup: WorkingGroup | null;
    handleLeaveConfirm: () => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function LeaveWorkingGroup({
    isOpen,
    onClose,
    selectedWorkingGroup,
    handleLeaveConfirm,
    isSubmitting,
    formError,
}: LeaveWorkingGroupModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('leave_working_group_title')}</ModalHeader>
                        <ModalBody>
                            <p>
                                {t('leave_working_group_message')}
                                <strong>{selectedWorkingGroup?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">{t('need_to_be_invited_again_message')}</p>
                            {formError && <p className="text-danger text-sm mt-2">{formError}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button variant="flat" onPress={onClose}>
                                {t('cancel_label')}
                            </Button>
                            <Button color="warning" onPress={handleLeaveConfirm} isLoading={isSubmitting}>
                                {t('leave_label')}
                            </Button>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
