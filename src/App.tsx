import { RouterProvider } from 'react-router-dom';
import router from './router';
import supabase from './lib/supabase';
import { useContext, useEffect } from 'react';
import { AuthContext } from './modules/auth/context/auth';
import './i18n';

function App() {
    const { setUser, setToken } = useContext(AuthContext);

    // biome-ignore lint/correctness/useExhaustiveDependencies: <explanation>
    useEffect(() => {
       // throw new Error('Esto es un error de pruebas, no te asustes :)');
        supabase.auth.onAuthStateChange((event, session) => {
           // console.log('onAuthStateChange: ', { event, session });
            switch (event) {
                case 'SIGNED_IN':
                case 'USER_UPDATED':
                case 'PASSWORD_RECOVERY':
                    if (session != null) {
                        setUser(session.user);
                        setToken(session.access_token);
                    }
                    break;

                case 'SIGNED_OUT':
                    setUser(null);
                    setToken(null);
                    break;
            }
        });
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    return <RouterProvider router={router} />;
}

export default App;

