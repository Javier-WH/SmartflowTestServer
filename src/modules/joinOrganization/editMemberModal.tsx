/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, ModalContent, ModalHeader, ModalBody, RadioGroup, Radio, Button } from '@nextui-org/react';
import { Member, MemberRoll, Org } from './menbers.tsx';
import { useEffect, useState } from 'react';
import useOrganizations from '../organizations/hook/useOrganizations.ts';


interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
  rolls: MemberRoll[];
  organization: Org | null;
}

export default function EditMemberModal({ member, setMember, rolls, organization }: EditMemberModalProps) {

  const { updateUserRoll } = useOrganizations();
  const [selectedRoll, setSelectedRoll] = useState<string | null>(null);


  useEffect(()=>{
    if (member) {
      setSelectedRoll(member.rollid);
    } else {
      setSelectedRoll(null);
    }
  },[rolls])

  const handleSave = () => {
    if (!member || !selectedRoll || !organization) return
    const data = { 
      roll_id: selectedRoll, 
      user_id: member.userid, 
      organization_id: organization.id 
    }
    updateUserRoll(data)
    .then((res) => {
      if (res.error) {
        console.error(res.error);
      }
      setMember(null);
    })
  }



  return (
    <Modal
      isOpen={!!member}
      onClose={() => setMember(null)}
      aria-labelledby="modal-title"
    >
      <ModalContent>
        <ModalHeader className="flex flex-col gap-1">{member ? member.useremail : ''}</ModalHeader>
        <ModalBody>
          {member && (
            <RadioGroup value={selectedRoll} label="Member Role" onChange={(event) => { setSelectedRoll(event.target.value) }}>
              {
                rolls.map((roll) => (
                  <Radio key={roll.id} value={roll.id}>
                    {roll.level}
                  </Radio>
                ))
              }
            </RadioGroup>
          )}
          <br />
          <Button color="primary" onClick={handleSave}>Save</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}