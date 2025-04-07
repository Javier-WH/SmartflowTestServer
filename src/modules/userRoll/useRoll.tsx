/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useState } from 'react';
import supabase from '../../lib/supabase';

export interface MemberRolltype {
  id: string;
  level: string;
  read: boolean;
  write: boolean;
  delete: boolean;
  invite: boolean;
}
export default function useRoll({userId, organizationId}: {userId: string, organizationId: string}) {

  const [memberRoll, setMemberRoll] = useState<MemberRolltype | null>(null);

  function getRoll() {
    supabase
      .from('organizations_users')
      .select(`
              roll:rolls (
              id,
              level,
              read,
              write,
              delete,
              invite
            )
      `)
      .eq('user_id', userId)
      .eq('organization_id', organizationId)
      .single()
      .then(({ data, error }) => {
        if (error) {
          console.error('Error fetching user permissions:', error);
          return
        }
        if (!data) {
          return
        }

       // eslint-disable-next-line @typescript-eslint/no-explicit-any
       setMemberRoll(data.roll as any);
        
      });
  }

  useEffect(() => {
    //console.log("Ejecutando useRoll con:", { userId, organizationId })
    // Solo ejecutamos si tenemos userId y organizationId válidos
    if (!userId || !organizationId) {
      setMemberRoll(null);
      return;
    }
    getRoll();
  }, [userId, organizationId]);

  return { memberRoll }
}