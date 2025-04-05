/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, ModalContent, ModalHeader, ModalBody, Button, Input } from '@nextui-org/react';
import { Member, Org } from './menbers.tsx';
import { useState } from 'react';
import useOrganizations from '../organizations/hook/useOrganizations.ts';



interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
  organization: Org | null;
}

export default function DeleteMemberModal({ member, setMember, organization }: EditMemberModalProps) {

  const { leaveOrganization } = useOrganizations();

  const [deleteInput, setDeleteInput] = useState<string>('');


  const handleDeleteMember = async () => {
    if (!member || !organization) return;
    await leaveOrganization(organization.id, member.userid);
    setMember(null);
  };


  return (
    <Modal
      isOpen={!!member}
      onClose={() => setMember(null)}
      aria-labelledby="modal-title"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">Delete Member</ModalHeader>
        <ModalBody>
          {member && (<>
            <label htmlFor="">
              Write <strong>{member.useremail}</strong> to confirm deletion
            </label>
            <Input
              label="Delete Member"
              value={deleteInput}
              onChange={(e) => setDeleteInput(e.target.value)}
            />
          </>
          )}
          <br />
          <Button 
            onClick={handleDeleteMember}
            disabled={deleteInput !== member?.useremail} 
            color={ deleteInput === member?.useremail ? 'danger' : 'default'}
          >
            Delete Member
          </Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}