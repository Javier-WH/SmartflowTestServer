/* eslint-disable react-hooks/exhaustive-deps */
import useAuth from '../auth/hooks/useAuth';
import useOrganizations from '../organizations/hook/useOrganizations';
import { useNavigate, useParams } from 'react-router-dom';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import { useEffect, useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { message } from 'antd';


interface Org {
  id: string;
  name: string;
  description: string;
  slug: string;

}

interface ResponseData{
  created_at: string;
  email: string;
  id: string;
  invited_by: string;
  organization_id: string;
  status: string;

}
export default function Menbers() {
  const { slug } = useParams();
  const {user, signOut } = useAuth();
  const navigate = useNavigate();
  const { getOrganizationBasicData } = useGetOrganizationData();
  const {inviteUserToOrganization} = useOrganizations();
  const [organization, setOrganization] = useState<Org | null>(null);
  const [email, setEmail] = useState<string>('');
  const [isValidEmail, setIsValidEmail] = useState<boolean>(false);
  const [inviteLink, setInviteLink] = useState<string | null>(null);

  useEffect(() => {
    if (!slug) return;
    getOrganizationBasicData(slug)
      .then(res => {
        setOrganization(res.data[0]);
      })
      .catch(err => console.log(err));
  }, [slug]);

  useEffect(() => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    setIsValidEmail(emailRegex.test(email));
  }, [email]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { value } = e.target;
    setInviteLink(null);
    setEmail(value);
  }
  const inviteOnClick = () => {
    const domain = import.meta.env.VITE_DOMAIN ?? 'localhost:5173';
    const inviterUserId = user?.id;
    const organizationId = organization?.id;

    if (!organizationId || !email || !inviterUserId) return;

    inviteUserToOrganization(organizationId, email, inviterUserId)
    .then(res => {
      if (res.error) {
        message.error(res.message);
        return;
      }
      const responseData = res.data as ResponseData[]; 
      const {id} = responseData[0];
      const link = `${domain}/join/${id}`;
      setInviteLink(link)
    })
    .catch(err => console.log(err));
  };

  const handleCopyLink = async () => {
    if (!inviteLink) return;
    try {
      await navigator.clipboard.writeText(inviteLink);
      message.success('Copy to clipboard');
    } catch (err) {
      console.error('Error al copiar:', err);
    }
  };

  return <>
    <header className="w-full flex justify-between items-center px-8 bg-white py-4 fixed top-0">
      <Button color="primary" onClick={() => navigate(-1)}>
        <IoMdArrowRoundBack />
      </Button>
      <Button color="primary" onClick={signOut}>
        Close session
      </Button>
    </header>
    <section className="py-8 max-w-7xl mx-auto mt-16">
      <div className="flex justify-between items-center mb-8">
        <h1 className="text-2xl font-semibold">{organization?.name}</h1>
      </div>
      <div className="mb-6 max-w-md flex gap-[10px] items-end ">
        <div>
          <label className="text-gray-500" htmlFor="input-newMember"> New member email </label>
          <Input
            id='input-newMember'
            placeholder="Write new member email"
            value={email}
            onChange={handleInputChange}
          />
        </div>
        <Button disabled={!isValidEmail} color={isValidEmail ? "primary" : "default"} onClick={inviteOnClick}>
          Invite
        </Button>
      </div>

      <div>
        {inviteLink && (
          <div className="flex flex-col gap-2 p-6 bg-white border border-blue-gray-200 rounded-lg shadow-sm max-w-[600px]">
            <p>We have sent an invitation email to {email}.</p>
            <br />
            <span className="text-gray-500">Click to copy the invite link:</span>
            <span style={{ cursor: "pointer" }} onClick={handleCopyLink} className="text-blue-600 hover:text-blue-800 hover:underline">{inviteLink}</span>
          </div>
        )}
      </div>
    </section>
  </>
}