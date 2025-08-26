import { uploadImageToStorage } from "./imgStorage";
import { putUploadMessageOnImages } from "./imgLoadingMessage";

/**
 * Procesa una cadena de HTML, sube las imágenes con 'data:' a un servidor
 * y reemplaza su atributo 'src' con la URL pública.
 * @param htmlString El contenido HTML completo de Quill.
 * @param id El identificador de la organización.
 * @param callback Función opcional que se llama con el HTML actualizado después de subir las imágenes, debe ser la funcion que actualiza el contenido del editor de quill.
 * @returns Una promesa que se resuelve con el HTML modificado.
 */
export async function processAndStoreImages(htmlString: string, id: string, callback?: (text: string) => void): Promise<string> {
  // 1. Crea un contenedor temporal en memoria para analizar el HTML.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // 2. Busca todas las etiquetas <img> en el HTML.
  const images = tempDiv.querySelectorAll('img:not(guided-checklist *)');
  //const images = tempDiv.querySelectorAll('img');

  // 3. Procesa cada imagen de forma asíncrona.
  const uploadPromises: Promise<void>[] = [];

  images.forEach(img => {
    const src = img.getAttribute('src');

    // Verifica si el 'src' es una Data URL.
    if (src && src.startsWith('data:image/')) {
      const promise = (async () => {
        try {
          // Extrae los datos Base64 de la Data URL.
          const base64Data = src.split(';base64,')[1];

          // Sube la cadena Base64 directamente.
          const publicLink = await uploadImageToStorage(base64Data, `${id}-${new Date().getTime()}`);

          // Reemplaza el src original con el nuevo enlace.
          img.setAttribute('src', publicLink);
        } catch (error) {
          console.error(`Error al procesar la imagen con src=${src}:`, error);
        }
      })();
      uploadPromises.push(promise);
    }
  });

  // 4. Espera a que todas las subidas de imágenes se completen.
  await Promise.all(uploadPromises);

  //actualiza las imagenes cargadas
  if (callback) callback(tempDiv.innerHTML);
  // 5. Devuelve el HTML modificado.
  return tempDiv.innerHTML;
}