import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { HeroUIProvider } from "@heroui/react";
import { AuthProvider } from './modules/auth/context/auth.tsx';
import { ToastContainer } from 'react-toastify';
import { ConfigProvider } from 'antd';
import 'react-responsive-pagination/themes/classic.css';
import 'react-toastify/dist/ReactToastify.css';
import './root.css';
import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <HeroUIProvider className="h-full">
            <AuthProvider>
                <ConfigProvider direction="rtl">
                    <App />
                    <ToastContainer />
                </ConfigProvider>
            </AuthProvider>
        </HeroUIProvider>
    </React.StrictMode>,
);
