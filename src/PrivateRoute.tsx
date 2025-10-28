import { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { Spinner } from "@heroui/react";

import { AuthContext } from './modules/auth/context/auth';

const PrivateRoute = ({ children }: { children: React.ReactElement }): React.ReactElement => {
    const { user } = useContext(AuthContext);
    const location = useLocation();

    if (user === undefined)
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );

    if (user === null) {
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
