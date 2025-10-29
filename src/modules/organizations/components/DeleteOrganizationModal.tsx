import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter } from "@heroui/react";
import type { Organization } from '../types/organizations';
import { useTranslation } from 'react-i18next';
import Button from "@/components/ui/Button";

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
    formError,
}: DeleteOrganizationModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t("delete_organization_title")}</ModalHeader>
                        <ModalBody>
                            <p>
                                {t("delete_organization_message")} <strong>{selectedOrganization?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">{t("this_action_cannot_be_undone_message")}</p>
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
