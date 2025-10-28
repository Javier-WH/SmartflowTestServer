/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@heroui/react';
import { message } from 'antd';
import { t } from 'i18next';
import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import useAuth from '../auth/hooks/useAuth';
import useWorkingGroupData from '../navBar/hooks/useWorkingGroupData';
import useWorkingGroup from '../working_group/hook/useWorkingGroup';

interface WorkingGroup {
    id: string;
    name: string;
    description: string;
    slug: string;
}
interface InvitationData {
    created_at: string;
    email: string;
    id: string;
    invited_by: string;
    working_group_id: string;
    status: string;
    level_id: string | null;
}

export default function JoinWorkingGroup() {
    const navigate = useNavigate();
    const { user, signOut } = useAuth();
    const { id: invitationId } = useParams();
    const { getWorkingGroupInvite, joinWorkingGroup } = useWorkingGroup();
    const { getWorkingGroupBasicDataById } = useWorkingGroupData();
    const [workingGroupId, setWorkingGroupId] = useState<string | null>(null);
    const [workingGroup, setWorkingGroup] = useState<WorkingGroup | null>(null);
    const [errorMessage, setErrorMessage] = useState<string | null>(null);
    const [invitationData, setInvitationData] = useState<InvitationData | null>(null);

    useEffect(() => {
        if (!invitationId) return;

        getWorkingGroupInvite(invitationId)
            .then(res => {
                if (res.error) {
                    message.error(res.message);
                    return;
                }

                if ((res.data as Array<InvitationData>).length === 0) {
                    setErrorMessage(t('invitation_already_used_message'));
                    return;
                }
                const data = res.data as InvitationData[];
                setWorkingGroupId(data?.[0]?.working_group_id);
                setInvitationData(data?.[0]);
            })
            .catch(err => {
                console.log(err);
            });
    }, [invitationId]);

    useEffect(() => {
        if (!workingGroupId) return;
        getWorkingGroupBasicDataById(workingGroupId)
            .then(res => {
                if (res.error) {
                    setErrorMessage(res.message);
                    return;
                }

                setWorkingGroup(res.data[0]);
            })
            .catch(err => console.log(err));
    }, [workingGroupId, invitationData]);

    useEffect(() => {
        if (!invitationData) return;
        if (user?.email !== invitationData.email) {
            setErrorMessage(t('do_not_have_permission_join_message'));
            return;
        }
    }, [invitationData]);

    const onClickJoin = () => {
        if (!invitationData) return;

        joinWorkingGroup(
            user?.id as string,
            invitationData.working_group_id,
            invitationData.level_id || '20d09d54-eb0b-498e-a6fa-910f598eec77',
        )
            .then(res => {
                if (res.error) {
                    message.error(res.message);
                    return;
                }

                navigate('/home');
            })
            .catch(err => console.log(err));
    };

    return (
        <>
            <header className="w-full flex justify-start items-center px-8 bg-white py-4 fixed top-0">
                <Button color="primary" onClick={signOut}>
                    {t('logout_button')}
                </Button>
            </header>

            <section className="py-8 max-w-7xl mx-auto mt-16">
                {errorMessage ? (
                    <div className="border border-red-200 bg-red-600 p-6 rounded-lg shadow-sm mx-auto max-w-md my-8 text-center">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-semibold text-white">{errorMessage}</h1>
                        </div>
                        <Button onClick={() => navigate('/home')}>{t('go_back_button')}</Button>
                    </div>
                ) : (
                    <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-sm w-full mx-auto my-8">
                        <div className="flex justify-between items-center mb-8">
                            <h1 className="text-2xl font-semibold">{workingGroup?.name}</h1>
                        </div>

                        <div className="flex justify-between items-center mb-8">
                            <p>{workingGroup?.description}</p>
                        </div>
                        <div className="mb-6 max-w-md flex gap-[10px] items-end ">
                            <Button color="primary" onClick={onClickJoin}>
                                {t('join_button')}
                            </Button>
                        </div>
                    </div>
                )}
            </section>
        </>
    );
}
