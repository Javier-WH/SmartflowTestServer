import type { ChangeEvent } from 'react';
import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Textarea } from '@heroui/react';
import { Button, Input } from '@/components/ui';

interface EditOrganizationModalProps {
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

export default function EditOrganizationModal({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    formError,
}: EditOrganizationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Edit Organization</ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody>
                                <div>
                                    <label htmlFor="name">Organization Name</label>
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
                                    <label htmlFor="description">Description</label>
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
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" isLoading={isSubmitting}>
                                    Save Changes
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
