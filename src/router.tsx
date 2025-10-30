import { createBrowserRouter, Navigate } from 'react-router-dom';
import ErrorPage from './errorsHandler/errorPage';
import ForgotPassword from './modules/auth/pages/ForgotPassword';
import ResetPassword from './modules/auth/pages/ResetPassword';
import SignIn from './modules/auth/pages/SignIn';
import SignUp from './modules/auth/pages/SignUp';
import Home from './modules/home/pages/Home';
import UserJoinOrganization from './modules/joinOrganization/joinOrganization';
import Members from './modules/joinOrganization/menbers';
import UserJoinWorkingGroup from './modules/joinWorkingGroup/joinWorkingGroup';
import Members from './modules/joinWorkingGroup/members';
import MainLayout from './modules/MainLayout';
import JoinWorkingGroup from './modules/onboarding/join-working-group';
import Organizations from './modules/organizations/organizations';
import Page from './modules/page/page';
import TaskManager from './modules/task_manager/pages/TaskManager';
import TextEditor from './modules/textEditor/textEditor';
import VersionViewer from './modules/textEditor/versionViewer';
import WorkingGroup from './modules/working_group/working_group';
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
                path: ':working_group_id',
                element: <Home />,
                children: [
                    { path: 'home' },
                    { path: 'page/:id', element: <Page /> },
                    { path: 'edit/:id', element: <TextEditor /> },
                    { path: 'history/:id', element: <VersionViewer /> },
                ],
            },
            {
                path: ':working_group_id/members',
                element: <Members />,
            },
            {
                path: 'home',
                element: <WorkingGroup />,
            },
            {
                path: 'working_group',
                element: <WorkingGroup />,
            },
            {
                path: 'join/:id',
                element: <UserJoinWorkingGroup />,
            },
            {
                path: 'task_manager',
                element: <TaskManager />,
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
