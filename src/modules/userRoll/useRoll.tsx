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
export default function useRoll({ userId, working_group_id }: { userId: string; working_group_id: string }) {
    const [memberRoll, setMemberRoll] = useState<MemberRolltype | null>(null);

    function getRoll() {
        supabase
            .from('working_group_users')
            .select(`
              roll:rolls (
              id,
              level,
              read,
              write,
              delete,
              invite,
              configure
            )
      `)
            .eq('user_id', userId)
            .eq('working_group_id', working_group_id)
            .single()
            .then(({ data, error }) => {
                if (error) {
                    console.error('Error fetching user permissions:', error);
                    return;
                }
                if (!data) {
                    return;
                }

                // eslint-disable-next-line @typescript-eslint/no-explicit-any
                setMemberRoll(data.roll as any);
            });
    }

    useEffect(() => {
        //console.log("Ejecutando useRoll con:", { userId, workingGroupId })
        // Solo ejecutamos si tenemos userId y workingGroupId válidos
        if (!userId || !working_group_id) {
            setMemberRoll(null);
            return;
        }
        getRoll();
    }, [userId, working_group_id]);

    return { memberRoll };
}
