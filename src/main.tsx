import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './modules/auth/context/auth.tsx';
import { ToastContainer } from 'react-toastify';
import { ConfigProvider } from 'antd';
import 'react-responsive-pagination/themes/classic.css';
import 'react-toastify/dist/ReactToastify.css';
import onScan from 'onscan.js';
import './root.css'
import './index.css';
onScan.attachTo(document);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NextUIProvider className="h-full">
            <AuthProvider>
                <ConfigProvider direction="rtl">
                    <App />
                    <ToastContainer />
                </ConfigProvider>
            </AuthProvider>
        </NextUIProvider>
    </React.StrictMode>,
);
