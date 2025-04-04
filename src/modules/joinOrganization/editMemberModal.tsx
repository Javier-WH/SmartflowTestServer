import { Modal, ModalContent, ModalHeader, ModalBody, RadioGroup, Radio } from '@nextui-org/react';
import { Member } from './menbers.tsx';
import { useState } from 'react';


interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
}

export default function EditMemberModal({ member, setMember }: EditMemberModalProps) {
    const [roll, setRoll] = useState<string | null>(null);


  return (
    <Modal
      isOpen={!!member} 
      onClose={() => setMember(null)} 
      aria-labelledby="modal-title"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{ member ? member.useremail : ''}</ModalHeader>
        <ModalBody>
          {member && (
              <RadioGroup value={member.rollname} label="User Role">
                <Radio value="admin">Admin</Radio>
                <Radio value="member">Member</Radio>
              </RadioGroup>
          )}
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}