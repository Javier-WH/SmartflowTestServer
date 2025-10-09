import { createBrowserRouter, Navigate } from 'react-router-dom';
import ErrorPage from './errorsHandler/errorPage';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';
import SignIn from './modules/auth/pages/SignIn';
import SignUp from './modules/auth/pages/SignUp';
import Home from './modules/home/pages/Home';
import UserJoinOrganization from './modules/joinOrganization/joinOrganization';
import Members from './modules/joinOrganization/menbers';
import MainLayout from './modules/MainLayout';
import JoinOrganization from './modules/onboarding/join-org';
import Organizations from './modules/organizations/organizations';
import Page from './modules/page/page';
import TaskManager from './modules/task_manager/pages/TaskManager';
import TextEditor from './modules/textEditor/textEditor';
import VersionViewer from './modules/textEditor/versionViewer';
import PrivateRoute from './PrivateRoute';

const router = createBrowserRouter([
    {
        path: '/',
        element: (
            <PrivateRoute>
                <MainLayout />
            </PrivateRoute>
        ),
        errorElement: <ErrorPage />,
        children: [
            {
                index: true,
                element: <Navigate to="/home" />,
            },
            {
                path: ':organization_id',
                element: <Home />,
                children: [
                    { path: 'home' },
                    { path: 'page/:id', element: <Page /> },
                    { path: 'edit/:id', element: <TextEditor /> },
                    { path: 'history/:id', element: <VersionViewer /> },
                ],
            },
            {
                path: ':organization_id/members',
                element: <Members />,
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
                path: 'join/:id',
                element: <UserJoinOrganization />,
            },
            {
                path: 'task_manager',
                element: <TaskManager />,
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
