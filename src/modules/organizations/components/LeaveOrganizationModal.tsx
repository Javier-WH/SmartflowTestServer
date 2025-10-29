import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter} from "@heroui/react";
import type { Organization } from '../types/organizations';
import { useTranslation } from 'react-i18next';
import Button from "@/components/ui/Button";

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
    formError,
}: LeaveOrganizationModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t("leave_organization_title")}</ModalHeader>
                        <ModalBody>
                            <p>
                                {t("leave_organization_message")}<strong>{selectedOrganization?.name}</strong>?
                            </p>
                            <p className="text-sm text-gray-500 mt-2">
                                {t("need_to_be_invited_again_message")}
                            </p>
                            {formError && <p className="text-danger text-sm mt-2">{formError}</p>}
                        </ModalBody>
                        <ModalFooter>
                            <Button neutral onClick={onClose} text={t("cancel_label")} />
                            <Button danger onClick={handleLeaveConfirm} text={t("leave_label")} />
                         
                        </ModalFooter>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
