import { createBrowserRouter } from 'react-router-dom';

import SignIn from './modules/auth/pages/SignIn';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';
import Home from './modules/home/pages/Home';

import { Navigate, redirect } from 'react-router-dom';
import isAuthenticated from './modules/auth/utils/isAuthenticated';

const router = createBrowserRouter([
    {
        path: '/',
        loader: async () => {
            if (!(await isAuthenticated())) {
                return redirect('/auth/signin');
            }

            return null;
        },
        element: <Home />,
        errorElement: <span>NothingFound</span>,
    },
    {
        path: '/auth',
        loader: async () => {
            if (await isAuthenticated()) {
                return redirect('/');
            }

            return null;
        },
        children: [
            {
                index: true,
                element: <Navigate to="/auth/signin" />,
            },
            {
                path: 'signin',
                element: <SignIn />,
            },
            // {
            //     path: 'signup',
            //     element: <SignUp />,
            // },
        ],
    },
    {
        path: '/forgot-password',
        element: <ForgotPassword />,
    },
    {
        path: '/reset-password',
        loader: async () => {
            if (!(await isAuthenticated())) {
                return redirect('/auth/signin');
            }

            return null;
        },
        element: <ResetPassword />,
    },
]);

export default router;
