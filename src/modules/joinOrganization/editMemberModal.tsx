/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, ModalContent, ModalHeader, ModalBody, RadioGroup, Radio, Button } from "@heroui/react";
import { Member, MemberRoll, Org } from './menbers.tsx';
import { useEffect, useState } from 'react';
import useOrganizations from '../organizations/hook/useOrganizations.ts';
import { useTranslation } from 'react-i18next';

interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
  rolls: MemberRoll[];
  organization: Org | null;
}

export default function EditMemberModal({ member, setMember, rolls, organization }: EditMemberModalProps) {

  const { updateUserRoll } = useOrganizations();
  const [selectedRoll, setSelectedRoll] = useState<string | null>(null);
  const { t } = useTranslation();

  useEffect(() => {
    if (member) {
      setSelectedRoll(member.rollid);
    } else {
      setSelectedRoll(null);
    }
  }, [rolls])

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



  /*<span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-md w-fit">
    {t('admin_label')}
  </span>*/

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
            <RadioGroup value={selectedRoll} label={t("member_role_label")} onChange={(event) => { setSelectedRoll(event.target.value) }}>
              {
                rolls.map((roll) => (
                  <div style={{ display: 'flex', gap: '8px', flexDirection: 'column', borderBottom: '1px solid #e5e7eb', paddingBottom: '8px' }} key={roll.id}>
                    <Radio key={roll.id} value={roll.id}>
                      {
                        t(`${roll.level.toLowerCase()}_label`)
                      }
                    </Radio>
                    <div style={{ display: 'flex', gap: '8px', flexDirection: 'row', marginLeft: '24px' }}>
                      {
                        roll.invite &&
                        <span className="text-xs bg-purple-500/20 text-purple-500 px-2 py-1 rounded-md w-fit">
                            {t("invite_label")}
                        </span>
                      }
                      {
                        roll.read &&
                        <span className="text-xs bg-gray-500/20 text-gray-500 px-2 py-1 rounded-md w-fit">
                            {t("read_label")}
                        </span>
                      }
                      {
                        roll.write &&
                        <span className="text-xs bg-green-500/20 text-green-500 px-2 py-1 rounded-md w-fit">
                            {t("write_label")}
                        </span>
                      }
                      {
                        roll.delete &&
                        <span className="text-xs bg-red-500/20 text-red-500 px-2 py-1 rounded-md w-fit">
                            {t("delete_label")}
                        </span>
                      }
                      {
                        roll.configure &&
                        <span className="text-xs bg-orange-500/20 text-orange-500 px-2 py-1 rounded-md w-fit">
                            {t("configure_label")}
                        </span>
                      }
                 
                    </div>
                  </div>
                ))
              }
            </RadioGroup>
          )}
          <br />
          <Button color="primary" onClick={handleSave}>{t("save_label")}</Button>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}