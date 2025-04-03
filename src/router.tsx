import { createBrowserRouter } from 'react-router-dom';
import SignIn from './modules/auth/pages/SignIn';
import SignUp from './modules/auth/pages/SignUp';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';
import Home from './modules/home/pages/Home';
import Page from './modules/page/page';
import { Navigate } from 'react-router-dom';
import MainLayout from './modules/MainLayout';
import PrivateRoute from './PrivateRoute';
import TextEditor from './modules/textEditor/textEditor';
import Organizations from './modules/organizations/organizations';
import JoinOrganization from './modules/onboarding/join-org';
import InviteOrganization from './modules/joinOrganization/inviteOrganization';
import UserJoinOrganization from './modules/joinOrganization/joinOrganization';


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
                path: ':organization_id/home',
                element: <Home />,
            },
            {
                path: 'home',
                element: <Organizations />,
            },
            {
                path: 'organizations',
                element: <Organizations />,
            },
            {
                path: 'page/:id',
                element: <Page />,
            },
            {
                path: 'textEditor/:id',
                element: <TextEditor />,
            },
            {
                path: 'invite/:slug',
                element: <InviteOrganization />,
            },
            {
                path: 'join/:id',
                element: <UserJoinOrganization />,
            },
        ],
    },
    {
        path: '/org/new',
        element: <JoinOrganization />,
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
