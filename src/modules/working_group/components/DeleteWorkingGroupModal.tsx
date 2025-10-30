import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import type { WorkingGroup } from '../types/working_group';
import { useTranslation } from 'react-i18next';
import Button from "@/components/ui/Button";

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
                            <Button neutral onClick={onClose} text={t("cancel_label")}/> 
                            <Button danger onClick={handleDeleteConfirm} text={t("delete_label")}/>
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
