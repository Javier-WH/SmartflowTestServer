import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader, Textarea } from '@heroui/react';
import type { ChangeEvent } from 'react';
import { useTranslation } from 'react-i18next';
import { Button, Input } from '@/components/ui';

interface EditWorkingGroupModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        id?: string;
        name: string;
        description: string;
    };
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function EditWorkingGroupModal({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    formError,
}: EditWorkingGroupModalProps) {
    const { t } = useTranslation();
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">{t('edit_working_group_title')}</ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody>
                                <div>
                                    <label htmlFor="name">{t('working_group_name_label')}</label>
                                    <Input
                                        id="name"
                                        name="name"
                                        value={formData.name}
                                        onChange={handleInputChange}
                                        autoFocus
                                        isRequired
                                    />
                                </div>
                                <div>
                                    <label htmlFor="description">{t('description_label')}</label>
                                    <Textarea
                                        id="description"
                                        name="description"
                                        value={formData.description}
                                        onChange={handleInputChange}
                                        variant="bordered"
                                        color="primary"
                                        classNames={{ inputWrapper: 'border' }}
                                    />
                                </div>
                                {formError && <p className="text-danger text-sm">{formError}</p>}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="bordered" onPress={onClose}>
                                    {t('cancel_label')}
                                </Button>
                                <Button type="submit" color="primary" isLoading={isSubmitting}>
                                    {t('save_changes_label')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
