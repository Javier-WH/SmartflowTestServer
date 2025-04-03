/* eslint-disable react-hooks/exhaustive-deps */
import { Button } from '@nextui-org/react';
import useAuth from '../auth/hooks/useAuth';
import { useNavigate, useParams } from 'react-router-dom';
import { useEffect, useState } from 'react';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import useOrganizations from '../organizations/hook/useOrganizations';
import { message } from 'antd';

interface Org {
  id: string;
  name: string;
  description: string;
  slug: string;

}
interface InvitationData{
  created_at: string;
  email: string;
  id: string;
  invited_by: string;
  organization_id: string;
  status: string;
  
}
interface Roll {
  id: string;
  level: string;
  read: boolean;
  write: boolean;
}
export default function JoinOrganization() {
  const navigate = useNavigate();
  const { user, signOut } = useAuth();
  const { id: invitationId } = useParams();
  const { getOrganizationInvite, joinOrganization, getUserRolls } = useOrganizations();
  const { getOrganizationBasicDataById } = useGetOrganizationData();
  const [organizationId, setOrganizationId] = useState<string | null>(null);
  const [organization, setOrganization] = useState<Org | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [invitationData, setInvitationData] = useState<InvitationData | null>(null);
  const [rolls, setRolls] = useState<Roll[]>([]);

  useEffect(() => {
    if (!user) return;
    getUserRolls()
      .then(res => {
        if (res.error) {
          message.error(res.message);
          return
        }
        setRolls(res.data as Roll[] || []);
      })
      .catch(err => {
        console.log(err);
      })
  }, []);

  useEffect(() => {
    if (!invitationId) return;

    getOrganizationInvite(invitationId)
      .then(res => {
        if (res.error) {
          message.error(res.message);
          return
        }

        if ((res.data as Array<InvitationData>).length === 0) {
          setErrorMessage('This invitation has already been used or does not exist');
          return
        }
        const data = res.data as InvitationData[];
        setOrganizationId(data?.[0]?.organization_id);
        setInvitationData(data?.[0]);
      })
      .catch(err => {
        console.log(err);
      })

  }, [invitationId]);


  useEffect(() => {
    if (!organizationId) return;
    getOrganizationBasicDataById(organizationId)
      .then(res => {
        if (res.error){
          setErrorMessage(res.message);
          return
        }
      
        setOrganization(res.data[0]);
      })
      .catch(err => console.log(err));
  }, [organizationId, invitationData]);

  useEffect(() => {
    if (!invitationData) return;
    if (user?.email !== invitationData.email) {
      setErrorMessage('You do not have permission to join this organization');
      return
    }
   }, [invitationData]);

  const onClickJoin = () => {
    if (!invitationData) return;
    const rollId = rolls.find(roll => roll.level === 'Manager')?.id as string;
    joinOrganization(user?.id as string, invitationData.organization_id, rollId)
      .then(res => {
        if (res.error) {
          message.error(res.message);
          return
        }
        navigate('/home');
      })
      .catch(err => console.log(err));
  }

  return <>
    <header className="w-full flex justify-end items-center px-8 bg-white py-4 fixed top-0">
      <Button color="primary" onClick={signOut}>
        Close session
      </Button>
    </header>

    <section className="py-8 max-w-7xl mx-auto mt-16">
      {
        errorMessage
          ? <div className="border border-red-200 bg-red-600 p-6 rounded-lg shadow-sm mx-auto max-w-md my-8 text-center">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold text-white">{errorMessage}</h1>
            </div>
            <Button onClick={() => navigate('/home')}>
              Go back
            </Button>
          </div>
          : <div className="bg-white p-6 rounded-lg border border-gray-200 max-w-sm w-full mx-auto my-8">
            <div className="flex justify-between items-center mb-8">
              <h1 className="text-2xl font-semibold">{organization?.name}</h1>
            </div>


            <div className="flex justify-between items-center mb-8">
              <p >{organization?.description}</p>
            </div>
            <div className="mb-6 max-w-md flex gap-[10px] items-end ">
              <Button color="primary" onClick={onClickJoin}>
                Join
              </Button>
            </div>
          </div>
      }


    </section>
  </>

}