import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

import { AuthContext } from './modules/auth/context/auth';

const PrivateRoute = ({ children }: { children: React.ReactElement }): React.ReactElement => {
    const { token } = useContext(AuthContext);
    const location = useLocation();

    if (!token) {
        return (
            <Navigate
                state={{ message: 'La sesión expiró. Inicia sesion nuevamente' }}
                to={`/auth/signin?redirect=${location.pathname}`}
            />
        );
    }

    return children;
};

export default PrivateRoute;
