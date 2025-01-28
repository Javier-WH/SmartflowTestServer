import { createBrowserRouter } from 'react-router-dom';

import SignIn from './modules/auth/pages/SignIn';
import SignUp from './modules/auth/pages/SignUp';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';

import Home from './modules/home/pages/Home';

import { Navigate } from 'react-router-dom';
import MainLayout from './modules/MainLayout';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <PrivateRoute>
                <MainLayout />
            </PrivateRoute>
        ),
        errorElement: <span>NothingFound</span>,
        children: [
            {
                index: true,
                element: <Navigate to="/home" />,
            },
            {
                path: 'home',
                element: <Home />,
            },
        ],
    },
    {
        path: '/auth',
        children: [
            {
                index: true,
                element: <Navigate to="/auth/signin" />,
            },
            {
                path: 'signin',
                element: <SignIn />,
            },
            {
                path: 'signup',
                element: <SignUp />,
            },
        ],
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/reset-password',
        element: <ResetPassword />,
    },
]);

export default router;
