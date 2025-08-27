

export function putUploadMessageOnImages (htmlString: string): string  {
  // 1. Crea un contenedor temporal en memoria para analizar el HTML.
  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = htmlString;

  // 2. Busca todas las etiquetas <img> en el HTML.
  const images = tempDiv.querySelectorAll('img:not(guided-checklist *)');

  images.forEach(img => {
    const src = img.getAttribute('src');

    // Verifica si el 'src' es una Data URL.
    if (src && src.startsWith('data:image/')) {
  
        try {
          img.setAttribute('src', 'Z'); // Guarda el src original en un atributo data-*
          console.log(`Colocando mensaje de carga en la imagen con src=${src}`);
        } catch (error) {
          console.error(`Error al procesar la imagen con src=${src}:`, error);
        }
   
     
    }
  });

  return tempDiv.innerHTML;
}