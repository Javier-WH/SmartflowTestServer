import { Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, Select, SelectItem, Chip } from '@heroui/react';

import { Input } from '@/components/ui';
import { useTranslation } from 'react-i18next';
import type { Organization } from '../modules/organizations/types/organizations';
import { UserRoll } from '../modules/organizations/organizations';
import { FiCheck, FiUsers } from 'react-icons/fi';
import Boton from '@/components/ui/Boton';
import useOrganizations from '@/modules/organizations/hook/useOrganizations';
import { useEffect, useState } from 'react';



export interface InviteUserModalProps {
    isOpen: boolean;
    onClose: () => void;
    userId: string;
}

export default function MultipleInviteUserModal({
    isOpen,
    onClose,
    userId,

}: InviteUserModalProps) {
    const { t } = useTranslation();
    const [organizationList, setOrganizationList] = useState<Organization | null>(null);
    const [userRolls, setUserRolls] = useState<UserRoll[]>([]);
    const [inviteEmail, setInviteEmail] = useState('');
    const [inviteUserLevelId, setInviteUserLevelId] = useState<string>('');
    const [inviteError, setInviteError] = useState('');
    const [isInviting, setIsInviting] = useState(false);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [selectedOrganizations, setSelectedOrganizations] = useState<Set<any>>(new Set());
    const { data: organizations, mutate, getUserRolls, inviteUserToOrganization } = useOrganizations(userId);


    const loadInitialData = async () => {
        await mutate();
        // solo deben aparecer los grupos de trabajo donde el usuario tenga permiso de invitar o sea el creador
        const selectableOrganizations = organizations?.filter(org => (org.invite === true || org.is_creator === true)) || [];

        setOrganizationList(selectableOrganizations);
        const rolls = await getUserRolls();
        if (rolls.error) {
            console.error(rolls.message);
            return;
        }
        setUserRolls(rolls.data as UserRoll[] || []);
        setInviteUserLevelId(rolls.data && rolls.data.length > 0 ? rolls.data[rolls.data.length - 1].id : '');
    }

    useEffect(() => {
        if (isOpen) {
            loadInitialData();
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [isOpen, organizations]);

    const handleClose = () => {
        // Reset form state on close
        setInviteEmail('');
        setInviteUserLevelId('');
        setInviteError('');
        setIsInviting(false);
        setSelectedOrganizations(new Set());
        onClose();
    };

    const handleInviteSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
 
        if (!inviteUserLevelId || inviteUserLevelId.trim() === '') {
            setInviteError(t('select_role_message'));
            return;
        }
 
        if (!inviteEmail.trim()) {
            setInviteError(t('enter_email_message'));
            return;
        }
 
        // Basic email validation
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(inviteEmail.trim())) {
            setInviteError(t('enter_valid_email_message'));
            return;
        }
 
        if (!selectedOrganizations || selectedOrganizations.size === 0 ) {
            setInviteError(t('select_working_groups_message'));
            return;
        }
        console.log(selectedOrganizations);
        
        setIsInviting(true);
        setInviteError('');
 
        try {
            const invitePromises = Array.from(selectedOrganizations).map(orgId =>
                inviteUserToOrganization(orgId, inviteEmail.trim(), userId, inviteUserLevelId)
            );

            const results = await Promise.all(invitePromises);

            const errorResult = results.find(res => res.error);
            if (errorResult) {
                setInviteError(errorResult.message);
                return;
            }

            handleClose();
        } catch (error) {
            setInviteError(t('unexpected_error_message'));
            console.error(error);
        } finally {
            setInviteError('');
            setIsInviting(false);
        }
        
    };

    return (
        <Modal
            isOpen={isOpen}
            onClose={handleClose}
            classNames={{
                base: "rounded-[15px]",
                wrapper: "z-[100]"
            }}
        >
            <ModalContent className="rounded-[15px] p-4 bg-white border border-gray-200 shadow-lg">
                {handleClose => (
                    <>
                        <ModalHeader className="flex flex-col gap-1 p-5 border-b border-gray-100">
                            <div className="flex items-center">
                                <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center mr-3">
                                    <FiUsers className="text-gray-600" />
                                </div>
                                <div>
                                    <h2 className="text-lg font-medium text-gray-800">
                                        {t('multiple_invite_user_title')}
                                    </h2>
                                    <p className="text-sm text-gray-500">
                                        {t('multiple_invite_user_subtitle')}
                                    </p>
                                </div>
                            </div>
                        </ModalHeader>
                        <form onSubmit={handleInviteSubmit}>
                            <ModalBody className="p-5 max-h-[calc(100vh-300px)] overflow-y-auto">

                                <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
                                    {t('select_working_groups_label')}
                                </label>
                                <Select
                                    style={{ overflowX: "hidden" }}
                                    id="organizations"
                                    items={
                                        Array.isArray(organizationList)
                                            ? organizationList.map(org => ({
                                                id: org.id,
                                                name: org.name,
                                            }))
                                            : []
                                    }
                                    selectionMode="multiple"
                                    selectedKeys={selectedOrganizations}
                                    onSelectionChange={(keys) => setSelectedOrganizations(new Set(keys))}
                                    placeholder={t('select_working_groups_placeholder')}
                                    isMultiline
                                    variant="bordered"
                                    renderValue={(items) => (
                                        <div className="flex flex-wrap gap-2">
                                            {items.map((item) => (
                                                <Chip key={item.key}>{item.data.name}</Chip>
                                            ))}
                                        </div>
                                    )}
                                    classNames={{
                                        base: "rounded-[15px]",
                                        trigger: "min-h-12 py-2",
                                    }}
                                >
                                    {(org) => (
                                        <SelectItem key={org.id} textValue={org.name}>
                                            <span className="text-sm text-gray-800">{org.name}</span>
                                        </SelectItem>
                                    )}
                                </Select>

                                <div className="mb-6">
                                    <label htmlFor="email" className="text-sm font-medium text-gray-700 block mb-2">
                                        {t('email_label')}
                                    </label>

                                    <Input
                                        id="email"
                                        className="pl-0 rounded-[15px] border-gray-300 focus:border-gray-400 transition-colors"
                                        placeholder="email@example.com"
                                        value={inviteEmail}
                                        onChange={e => setInviteEmail(e.target.value)}
                                        type="email"
                                        autoFocus
                                        isRequired
                                    />

                                </div>

                                <div className="mb-4">
                                    <h3 className="text-sm font-medium text-gray-700 mb-4">{t("member_role_label")}</h3>
                                    <div className="space-y-3">
                                        {userRolls && userRolls
                                            .sort((a, b) => {
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
                                            })
                                            .map((role) => (
                                                <div
                                                    key={role.id}
                                                    className={`border rounded-[15px] p-4 transition-all cursor-pointer ${inviteUserLevelId === role.id
                                                        ? 'border-gray-400 bg-gray-100'
                                                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                                                        }`}
                                                    onClick={() => setInviteUserLevelId && setInviteUserLevelId(role.id)}
                                                >
                                                    <div className="flex items-start justify-between">
                                                        <div className="flex flex-col">
                                                            <span className="text-medium font-medium text-gray-800">
                                                                {t(`${role.level.toLowerCase()}_label`)}
                                                            </span>
                                                            <div className="flex flex-wrap gap-2 mt-2">
                                                                {role.invite && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t("invite_label")}
                                                                    </span>
                                                                )}
                                                                {role.read && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t("read_label")}
                                                                    </span>
                                                                )}
                                                                {role.write && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t("write_label")}
                                                                    </span>
                                                                )}
                                                                {role.delete && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t("delete_label")}
                                                                    </span>
                                                                )}
                                                                {role.configure && (
                                                                    <span className="text-xs bg-gray-200 text-gray-700 px-2 py-1 rounded-md">
                                                                        {t("configure_label")}
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
                                <Boton neutral onClick={handleClose} text={t('cancel_label')} />
                                <Boton loading={isInviting} type="submit" text={t('send_button')} />
                            </ModalFooter>
                        </form>
                    </>
                )}
            </ModalContent>
        </Modal>
    );
}