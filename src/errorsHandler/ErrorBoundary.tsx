// Import the ErrorBoundary component from the library
import { ErrorBoundary } from 'react-error-boundary';
import { ReactNode } from 'react';
import supabase from '@/lib/supabase';
import { t } from 'i18next';



// Define a fallback component to render when an error occurs
const ErrorFallback = ({ error, resetErrorBoundary }) => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{t('error_page_title')}</h1>
        <p className="text-lg mb-6">{t('error_page_description')}</p>
        <details className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          <summary className="cursor-pointer font-semibold">{t('error_page_details')}</summary>
          <pre className="mt-2 text-left whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            <code className="block">{error.toString()}</code>
          </pre>
        </details>

      
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          onClick={resetErrorBoundary}
        >
          {t('go_back_button')}
        </button>
      </div>
    </div>
  );
};

// Define a function to log the error to Supabase
const logErrorToSupabase = async (error) => {
  console.error("Error capturado por Error Boundary:", error);
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    const { data, error: supabaseError } = await supabase
      .from('errors_log')
      .insert([errorData]);

    if (supabaseError) {
      console.error("Error al guardar el error en Supabase:", supabaseError.message);
    } else {
      console.log("Error guardado en Supabase:", data);
    }
  } catch (e) {
    console.error("Error inesperado al intentar guardar en Supabase:", e);
  }
};

interface ErrorBoundaryProps {
  children: ReactNode;
}


const AppErrorBoundary = ({ children }: ErrorBoundaryProps) => {
  return (
    <ErrorBoundary
      FallbackComponent={ErrorFallback}
      onReset={() => {
        window.location.href = '/'; 
      }}
      onError={logErrorToSupabase}
    >
      {children}
    </ErrorBoundary>
  );
};

export default AppErrorBoundary;