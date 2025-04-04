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
  const [organization, setOrganization] = useState<Org | null>(null);


  useEffect(() => {
    if (!slug) return;
    getOrganizationBasicData(slug)
      .then(res => {
        setOrganization(res.data[0]);
      })
      .catch(err => console.log(err));
  }, [slug]);








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

    </section>
  </>
}