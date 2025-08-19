import supabase from '../../../lib/supabase';
import { v4 as uuidv4 } from 'uuid';

/**
 * Convierte una cadena codificada en Base64 en un objeto Blob.
 * @param b64Data La cadena Base64 sin el prefijo.
 * @param contentType El tipo MIME de la imagen (ej. 'image/jpeg').
 * @returns Un objeto Blob.
 */
function b64toBlob(b64Data: string, contentType = ''): Blob {
  const byteCharacters = atob(b64Data);
  const byteNumbers = new Array(byteCharacters.length);
  for (let i = 0; i < byteCharacters.length; i++) {
    byteNumbers[i] = byteCharacters.charCodeAt(i);
  }
  const byteArray = new Uint8Array(byteNumbers);
  return new Blob([byteArray], { type: contentType });
}

/**
 * Sube una imagen en formato Base64 a Supabase Storage y devuelve la URL pública.
 * @param base64Image La imagen en formato Base64 (sin el prefijo 'data:image/...').
 * @param originalFilename El nombre original del archivo (ej. 'mi-foto.png').
 * @returns Una Promesa que se resuelve con la URL pública de la imagen.
 */
export async function uploadImageToStorage(base64Image: string, originalFilename: string): Promise<string> {
  try {
    // 1. Deducir el tipo de contenido (MIME type) de la imagen.
    const contentType = `image/${originalFilename.split('.').pop()?.toLowerCase() || 'jpeg'}`;
    const imageBlob = b64toBlob(base64Image, contentType);

    // 2. Generar un nombre de archivo único.
    const fileExtension = originalFilename.split('.').pop();
    const fileName = `${uuidv4()}.${fileExtension}`;
    const bucketName = 'smartfloImages';

    // 3. Subir el archivo al bucket de Supabase.
    const { error } = await supabase.storage
      .from(bucketName)
      .upload(fileName, imageBlob, {
        cacheControl: '3600', // Un año
        upsert: false,
      });

    if (error) {
      throw new Error(`Error al subir la imagen a Supabase: ${error.message}`);
    }

    // 4. Obtener la URL pública del archivo.
    const { data: publicUrlData } = supabase
      .storage
      .from(bucketName)
      .getPublicUrl(fileName);

    if (publicUrlData) {
      return publicUrlData.publicUrl;
    } else {
      throw new Error('No se pudo obtener la URL pública de la imagen de Supabase.');
    }
  } catch (error) {
    console.error('Ha ocurrido un error en la subida:', error);
    throw error;
  }
}