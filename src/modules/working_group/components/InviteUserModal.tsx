import { Modal, ModalBody, ModalContent, ModalFooter, ModalHeader } from '@heroui/react';
import { useTranslation } from 'react-i18next';
import { FiCheck, FiMail, FiUserPlus, FiUsers, FiX } from 'react-icons/fi';
import { Button, Input } from '@/components/ui';
import type { WorkingGroup } from '../types/working_group';
import type { UserRoll } from '../working_group';

export interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    selectedWorkingGroup: WorkingGroup | null;
    inviteEmail: string;
    setInviteEmail: (email: string) => void;
    setInviteUserLevelId?: (levelId: string) => void;
    inviteUserLevelId?: string;
    handleSubmit: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
    isInviting: boolean;
    inviteError: string;
    userRolls?: UserRoll[];
}

export default function InviteUserModal({
    isOpen,
    onClose,
    selectedWorkingGroup,
    inviteEmail,
    setInviteEmail,
    handleSubmit,
    isInviting,
    inviteError,
    setInviteUserLevelId,
    inviteUserLevelId,
    userRolls,
}: InviteUserModalProps) {
    const { t } = useTranslation();

    return (
        <Modal
            isOpen={isOpen}
            onClose={onClose}
            classNames={{
                base: 'rounded-[15px]',
                wrapper: 'z-[100]',
            }}
        >
            <ModalContent className="rounded-[15px] p-4 bg-white border border-gray-200 shadow-lg">
                {onClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 p-5 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                    <FiUsers className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-800">
                                        {t('invite_user_title')} {selectedWorkingGroup?.name}
                                    </h2>
                                    <p className="text-sm text-gray-500">{t('invite_user_subtitle')}</p>
                                </div>
                            </div>
                        </ModalHeader>
                        <form onSubmit={handleSubmit}>
                            <ModalBody className="p-5">
                                <div className="mb-6">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
                                        {t('email_label')}
                                    </label>
                                    <div className="relative">
                                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <FiMail className="text-gray-400" />
                                        </div>
                                        <Input
                                            id="email"
                                            className="pl-10 rounded-[15px] border-gray-300 focus:border-gray-400 transition-colors"
                                            placeholder="email@example.com"
                                            value={inviteEmail}
                                            onChange={e => setInviteEmail(e.target.value)}
                                            type="email"
                                            autoFocus
                                            isRequired
                                        />
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">{t('member_role_label')}</h3>
                                    <div className="space-y-3">
                                        {userRolls
                                            ?.sort((a, b) => {
                                                const order = ['Admin', 'Editor'];
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
                                            })
                                            .map(role => (
                                                <div
                                                    key={role.id}
                                                    className={`border rounded-[15px] p-4 transition-all cursor-pointer ${
                                                        inviteUserLevelId === role.id
                                                            ? 'border-gray-400 bg-gray-100'
                                                            : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                    }`}
                                                    onClick={() =>
                                                        setInviteUserLevelId && setInviteUserLevelId(role.id)
                                                    }
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-medium font-medium text-gray-800">
                                                                {t(`${role.level.toLowerCase()}_label`)}
                                                            </span>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {role.invite && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t('invite_label')}
                                                                    </span>
                                                                )}
                                                                {role.read && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t('read_label')}
                                                                    </span>
                                                                )}
                                                                {role.write && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t('write_label')}
                                                                    </span>
                                                                )}
                                                                {role.delete && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t('delete_label')}
                                                                    </span>
                                                                )}
                                                                {role.configure && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t('configure_label')}
                                                                    </span>
                                                                )}
                                                            </div>
                                                        </div>
                                                        {inviteUserLevelId === role.id && (
                                                            <div className="w-5 h-5 rounded-full bg-gray-400 flex items-center justify-center">
                                                                <FiCheck className="text-white text-xs" />
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                    </div>
                                </div>

                                {inviteError && <p className="text-danger text-sm mt-2">{inviteError}</p>}
                            </ModalBody>
                            <ModalFooter className="p-5 pt-4 border-t border-gray-100">
                                <Button
                                    className="rounded-[15px] px-5 bg-gray-100 text-gray-700 font-medium hover:bg-gray-200"
                                    onPress={onClose}
                                >
                                    <FiX className="mr-2" />
                                    {t('cancel_label')}
                                </Button>
                                <Button
                                    type="submit"
                                    className="bg-white text-gray-800 border border-gray-300 rounded-[15px] px-6 py-2 font-medium transition-colors duration-200 hover:bg-gray-100"
                                    isLoading={isInviting}
                                >
                                    <FiUserPlus className="mr-2" />
                                    {t('send_button')}
                                </Button>
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}
