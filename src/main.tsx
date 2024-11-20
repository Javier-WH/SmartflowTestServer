import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './modules/auth/context/auth.tsx';
import { ToastContainer } from 'react-toastify';

import './index.css';
import 'react-responsive-pagination/themes/classic.css';
import 'react-toastify/dist/ReactToastify.css';
import onScan from 'onscan.js';
onScan.attachTo(document);

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NextUIProvider className="h-full">
            <AuthProvider>
                <App />
                <ToastContainer />
            </AuthProvider>
        </NextUIProvider>
    </React.StrictMode>,
);
