// Define la interfaz para la respuesta de la API de ImgBB.
export interface ImgBBResponse {
  data: {
    url: string;
  };
  success: boolean;
  status: number;
}


// Esta función esta subiendo las imagenes a ImgBB y regresando el link publico de la imagen, 
// si se va a usar otro servidor de imagenes, debe asegurarse de que reciba la imagen en base64 y regrese la url de la imagen
/**
 * Sube una cadena de datos Base64 a ImgBB y devuelve la URL pública.
 * @param base64Image La imagen en formato Base64 (sin el prefijo 'data:image/...').
 * @returns Una Promesa que se resuelve con la URL pública de la imagen.
 */
export async function uploadImageToStorage(base64Image: string): Promise<string> {
  const apiKey = '91eedcd947a5595f098ad4cb1188123f';

  // Crea un objeto FormData para enviar la imagen a la API.
  const formData = new FormData();
  formData.append('key', apiKey);
  formData.append('image', base64Image);

  try {
    const response = await fetch('https://api.imgbb.com/1/upload', {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(`Error al subir la imagen a ImgBB: ${response.status} - ${errorData.error.message}`);
    }

    const data: ImgBBResponse = await response.json();

    if (data.success && data.data.url) {
      return data.data.url;
    } else {
      throw new Error('La respuesta de la API de ImgBB no contiene una URL válida.');
    }
  } catch (error) {
    console.error('Ha ocurrido un error en la subida:', error);
    throw error;
  }
}