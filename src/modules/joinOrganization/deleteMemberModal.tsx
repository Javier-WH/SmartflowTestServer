/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, ModalContent, ModalHeader } from "@heroui/react";
import { Member, Org } from './menbers.tsx';
import useOrganizations from '../organizations/hook/useOrganizations.ts';
import Boton from "@/components/ui/Boton.tsx";
import { t } from "i18next";



interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
  organization: Org | null;
}

export default function DeleteMemberModal({ member, setMember, organization }: EditMemberModalProps) {

  const { leaveOrganization, deleteInvitation } = useOrganizations();


  const handleDeleteMember = async () => {
    if (!member || !organization) return;
    await leaveOrganization(organization.id, member.userid);
    await deleteInvitation(organization.id, member.useremail);
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

        <Boton danger text={t('delete_menber_label')} onClick={handleDeleteMember} />

      </ModalContent>
    </Modal>
  );
}