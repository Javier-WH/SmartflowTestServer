import type { ChangeEvent } from 'react';
import {
    Modal,
    ModalContent,
    ModalHeader,
    ModalBody,
    ModalFooter,
    Button,
    Input,
    Textarea,
} from '@nextui-org/react';

interface CreateOrganizationModalProps {
    isOpen: boolean;
    onClose: () => void;
    formData: {
        name: string;
        description: string;
    };
    handleInputChange: (e: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => void;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isSubmitting: boolean;
    formError: string;
}

export default function CreateOrganizationModal({
    isOpen,
    onClose,
    formData,
    handleInputChange,
    handleSubmit,
    isSubmitting,
    formError,
}: CreateOrganizationModalProps) {
    return (
        <Modal isOpen={isOpen} onClose={onClose}>
            <ModalContent>
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1">Create New Organization</ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody>
                                <Input
                                    label="Organization Name"
                                    name="name"
                                    value={formData.name}
                                    onChange={handleInputChange}
                                    autoFocus
                                    isRequired
                                />
                                <Textarea
                                    label="Description"
                                    name="description"
                                    value={formData.description}
                                    onChange={handleInputChange}
                                    placeholder="Describe your organization (optional)"
                                />
                                {formError && <p className="text-danger text-sm">{formError}</p>}
                            </ModalBody>
                            <ModalFooter>
                                <Button variant="flat" onPress={onClose}>
                                    Cancel
                                </Button>
                                <Button type="submit" color="primary" isLoading={isSubmitting}>
                                    Create
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
