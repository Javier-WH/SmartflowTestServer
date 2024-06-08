import { createBrowserRouter } from 'react-router-dom';

import SignIn from './modules/auth/pages/SignIn';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';

import Home from './modules/home/pages/Home';
import Orders from './modules/orders/pages/Orders';
import Inventory from './modules/inventory/pages/Inventory';

import { Navigate, redirect } from 'react-router-dom';
import isAuthenticated from './modules/auth/utils/isAuthenticated';
import MainLayout from './modules/MainLayout';

const router = createBrowserRouter([
    {
        path: '/',
        loader: async () => {
            if (!(await isAuthenticated())) {
                return redirect('/auth/signin');
            }

            return null;
        },
        element: <MainLayout />,
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
            {
                path: 'ordenes',
                element: <Orders />,
            },
            {
                path: 'inventario',
                element: <Inventory />,
            },
        ],
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
    {
        path: '/orders',
        loader: async () => {
            if (!(await isAuthenticated())) {
                return redirect('/auth/signin');
            }

            return null;
        },
        element: <Orders />,
    },
]);

export default router;
