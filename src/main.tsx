import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App.tsx';
import { NextUIProvider } from '@nextui-org/react';
import { AuthProvider } from './modules/auth/context/auth.tsx';

import './index.css';

ReactDOM.createRoot(document.getElementById('root')!).render(
    <React.StrictMode>
        <NextUIProvider className="h-full">
            <AuthProvider>
                <App />
            </AuthProvider>
        </NextUIProvider>
    </React.StrictMode>,
);
