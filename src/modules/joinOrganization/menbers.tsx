/* eslint-disable react-hooks/exhaustive-deps */
import useAuth from '../auth/hooks/useAuth';
import useOrganizations from '../organizations/hook/useOrganizations';
import { useNavigate, useParams } from 'react-router-dom';
import useGetOrganizationData from '../navBar/hooks/useOrganizationData';
import { useEffect, useState } from 'react';
import { Button, Input } from '@nextui-org/react';
import { IoMdArrowRoundBack } from "react-icons/io";
import { ImUser } from "react-icons/im";
import { CiMenuKebab } from "react-icons/ci";



interface Org {
  id: string;
  name: string;
  description: string;
  slug: string;

}

interface Member {
  rollid: string;
  rollname: string;
  userid: string;
  useremail: string;
}


export default function Menbers() {
  const { slug } = useParams();
  const { signOut } = useAuth();
  const navigate = useNavigate();
  const { getOrganizationMembers } = useOrganizations();
  const { getOrganizationBasicData } = useGetOrganizationData();
  const [organization, setOrganization] = useState<Org | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<Member[]>([]);
  const [filter, setFilter] = useState<string>('');

  useEffect(() => {
    if (!slug) return;
    getOrganizationBasicData(slug)
      .then(res => {
        setOrganization(res.data[0]);
      })
      .catch(err => console.log(err));
  }, [slug]);


  useEffect(() => {
    if (!organization) return;

    getOrganizationMembers(organization.id)
      .then((res) => {
        if (res.error) {
          console.log(res.error);
          return;
        }
        setMembers(res.data as Member[]);
      })
      .catch(err => console.log(err));

  }, [organization]);


  useEffect(() => {
    if (!members) return;

    if (filter === '') {
      setFilteredMembers(members);
      return;
    }
    const filtered = members.filter((member) => member.useremail.toLowerCase().includes(filter.toLowerCase()));
    setFilteredMembers(filtered);
  }, [filter, members]);


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
      <Input 
        className='max-w-[900px]' 
        value={filter} 
        onChange={(e) => setFilter(e.target.value)} 
        label="Search members" 
        placeholder="Search by email"  
      />
      <div className="flex flex-col gap-1">
        {
          filteredMembers.map((member) => (
            <div key={member.userid}
              className="
                flex items-center 
                justify-between 
                max-w-[900px]
                border border-gray-100
                rounded-xl
                bg-white
                shadow-sm
                p-3"
            >
              <div className="flex items-center">
                <ImUser className="w-10 h-10 rounded-full mr-4" />
                <div>
                  <h2 className="text-lg font-semibold">{member.useremail}</h2>
                  <p className="text-gray-500">{member.rollname}</p>
                </div>
              </div>
              <CiMenuKebab style={{ cursor: "pointer" }} />
            </div>
          ))
        }
      </div>


    </section>
  </>
}