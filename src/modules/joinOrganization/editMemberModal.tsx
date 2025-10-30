/* eslint-disable react-hooks/exhaustive-deps */
import { Modal, ModalContent, ModalHeader, ModalBody } from "@heroui/react";
import { Member, MemberRoll, WorkingGroup } from './menbers.tsx';
import { useEffect, useState } from 'react';
import useOrganizations from '../organizations/hook/useOrganizations.ts';
import { useTranslation } from 'react-i18next';
import { FiUser, FiCheck } from 'react-icons/fi';
import Button from "@/components/ui/Button.tsx";

interface EditMemberModalProps {
  member: Member | null;
  setMember: (member: Member | null) => void;
  rolls: MemberRoll[];
  organization: WorkingGroup | null;
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

  return (
    <Modal
      isOpen={!!member}
      onClose={() => setMember(null)}
      aria-labelledby="modal-title"
      classNames={{
        base: "rounded-[15px]",
        wrapper: "z-[100]"
      }}
    >
      <ModalContent className="rounded-[15px] p-4 bg-white border border-gray-200 shadow-lg">

        <>
          <ModalHeader className="flex flex-col gap-1 p-5 border-b border-gray-100">
            <div className="flex items-center">
              <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                <FiUser className="text-gray-600" />
              </div>
              <div>
                <h2 className="text-lg font-medium text-gray-800">{member ? member.useremail : ''}</h2>
                <p className="text-sm text-gray-500">{t("edit_role_subtitle")}</p>
              </div>
            </div>
          </ModalHeader>
          <ModalBody className="p-5">
            {member && (
              <div className="mb-6">
                <h3 className="text-sm font-medium text-gray-700 mb-4">{t("member_role_label")}</h3>
                <div className="space-y-3">
                  {rolls.sort((a, b) => {
                    const order = ["Admin", "Editor"];
                    const aIndex = order.indexOf(a.level);
                    const bIndex = order.indexOf(b.level);

                    if (aIndex !== -1 && bIndex !== -1) {
                      return aIndex - bIndex;
                    }
                    if (aIndex !== -1) {
                      return -1;
                    }
                    if (bIndex !== -1) {
                      return 1;
                    }
                    return 0;
                  }).map((roll) => (
                    <div
                      key={roll.id}
                      className={`border rounded-[15px] p-4 transition-all cursor-pointer ${selectedRoll === roll.id
                        ? 'border-gray-400 bg-gray-100'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                        }`}
                      onClick={() => setSelectedRoll(roll.id)}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex flex-col">
                          <span className="text-medium font-medium text-gray-800">
                            {t(`${roll.level.toLowerCase()}_label`)}
                          </span>
                          <div className="flex flex-wrap gap-2 mt-2">
                            {roll.invite && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                {t("invite_label")}
                              </span>
                            )}
                            {roll.read && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                {t("read_label")}
                              </span>
                            )}
                            {roll.write && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                {t("write_label")}
                              </span>
                            )}
                            {roll.delete && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                {t("delete_label")}
                              </span>
                            )}
                            {roll.configure && (
                              <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                {t("configure_label")}
                              </span>
                            )}
                          </div>
                        </div>
                        {selectedRoll === roll.id && (
                          <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                            <FiCheck className="text-white text-xs" />
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
            <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">


              <Button neutral text={t("cancel_label")} onClick={() => setMember(null)} />
              <Button text={t("save_label")} onClick={handleSave} />


            </div>
          </ModalBody>
        </>
      </ModalContent>
    </Modal>
  );
}
