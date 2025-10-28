/* eslint-disable react-hooks/exhaustive-deps */
import { Button, Input, Modal, ModalBody, ModalContent, ModalHeader } from '@heroui/react';
import { useState } from 'react';
import useWorkingGroup from '../working_group/hook/useWorkingGroup';
import type { Member, WorkingGroup } from './members.tsx';

interface EditMemberModalProps {
    member: Member | null;
    setMember: (member: Member | null) => void;
    working_group: WorkingGroup | null;
}

export default function DeleteMemberModal({ member, setMember, working_group }: EditMemberModalProps) {
    const { leaveWorkingGroup, deleteInvitation } = useWorkingGroup();

    const [deleteInput, setDeleteInput] = useState<string>('');

    const handleDeleteMember = async () => {
        if (!member || !working_group) return;
        await leaveWorkingGroup(working_group.id, member.userid);
        await deleteInvitation(working_group.id, member.useremail);
        setMember(null);
    };

    return (
        <Modal isOpen={!!member} onClose={() => setMember(null)} aria-labelledby="modal-title">
            <ModalContent>
                <ModalHeader className="flex flex-col gap-1">Delete Member</ModalHeader>
                <ModalBody>
                    {member && (
                        <>
                            <label htmlFor="">
                                Write <strong>{member.useremail}</strong> to confirm deletion
                            </label>
                            <Input
                                label="Delete Member"
                                value={deleteInput}
                                onChange={e => setDeleteInput(e.target.value)}
                            />
                        </>
                    )}
                    <br />
                    <Button
                        onClick={handleDeleteMember}
                        disabled={deleteInput !== member?.useremail}
                        color={deleteInput === member?.useremail ? 'danger' : 'default'}
                    >
                        Delete Member
                    </Button>
                </ModalBody>
            </ModalContent>
        </Modal>
    );
}
