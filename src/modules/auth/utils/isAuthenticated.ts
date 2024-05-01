import supabase from '../../../lib/supabase';

export default async function isAuthenticated(): Promise<boolean> {
    const {
        data: { session },
    } = await supabase.auth.getSession();
    return session != null;

    // const token = localStorage.getItem('token');
    // const user = localStorage.getItem('user');
    //
    // if (token != null && user != null) return true;
    //
    // return false;
}
