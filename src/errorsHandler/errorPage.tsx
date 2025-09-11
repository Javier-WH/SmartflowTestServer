import { useEffect } from 'react';
import { useRouteError } from 'react-router-dom';
import supabase from '@/lib/supabase';
import { t } from 'i18next';

const logErrorToSupabase = async (error) => {
  try {
    const errorData = {
      message: error.message,
      stack: error.stack,
      timestamp: new Date().toISOString(),
    };

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { data, error: supabaseError } = await supabase.from('errors_log').insert([errorData]);

    console.error("Error capturado y simulando guardado en Supabase:", errorData);

    if (supabaseError) {
      console.error("Error al guardar el error en Supabase:", supabaseError.message);
    } else {
      console.log("Error simulado guardado en Supabase.");
    }
  } catch (e) {
    console.error("Error inesperado al intentar guardar en Supabase:", e);
  }
};


const ErrorPage = () => {
  const error = useRouteError();
  console.error(error);


  useEffect(() => {
    logErrorToSupabase(error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100 dark:bg-gray-900 text-gray-800 dark:text-white p-4">
      <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 max-w-lg w-full text-center">
        <h1 className="text-4xl font-bold text-red-600 mb-4">{t('error_page_title')}</h1>
        <p className="text-lg mb-6">{t('error_page_description')}</p>
        <div className="text-sm text-gray-500 dark:text-gray-400 mt-4">
          <p className="font-semibold">{t('error_page_details')}</p>
          <p className="mt-2 text-left whitespace-pre-wrap break-words bg-gray-50 dark:bg-gray-700 p-4 rounded-lg">
            {(error as { statusText?: string; message?: string })?.statusText || (error as { message?: string })?.message || 'Error desconocido'}
          </p>
        </div>
        <button
          className="mt-6 px-6 py-3 bg-blue-600 text-white rounded-lg shadow-md hover:bg-blue-700 transition-colors"
          onClick={() => window.location.href = '/'}
        >
           {t('go_back_button')}
        </button>
      </div>
    </div>
  );
};

export default ErrorPage;