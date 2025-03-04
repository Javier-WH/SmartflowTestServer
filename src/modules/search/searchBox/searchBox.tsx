import type { SearchBoxInterface } from "../types/searchBox"
import unPublishedFile from '../../folderNavigator/assets/svg/unPublishedFile.svg'
export default function SearchBox({ data, word }: { data: SearchBoxInterface[], word: string }) {

  //console.log(data)
  return <div style={{
    position: 'absolute',
    width: '100%',
    border: '1px solid black',
    top: '100%',
    visibility: (data.length === 0 || word.length === 0) ? 'hidden' : 'visible'
  }}>
    {
      data.map((item, index) => {
        const htmlString = getSelectedText(word, item.content) || '';
        return <div
          key={index}
          style={{
            backgroundColor: 'white',
            display: 'flex',
            alignItems: 'center',
            gap: '5px',
          }}
        >
          <img src={unPublishedFile} alt="" width={35} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span>{item.name}</span>
            <span
              style={{
                border: '1px solid black',
                display: 'block',
                height: '40px',
              }}
              dangerouslySetInnerHTML={{ __html: htmlString }} 
            />

          </div>
        </div>
      })
    }

  </div>
}


function getSelectedText(palabra: string, htmlString: string) {
  // Buscar la primera etiqueta que contenga la palabra
  const regex = new RegExp(`<([a-z]+)[^>]*>(.*?${palabra}.*?)</\\1>`, 'i');
  const match = htmlString.match(regex);

  if (!match) return null;

  const tagName = match[1];   // The tag name (e.g., 'p', 'div')
  const content = match[2];     // The content inside the tag

  // Reemplazar solo la primera ocurrencia de la palabra con <strong>
  const newContent = content.replace(
    new RegExp(`(${palabra})`),
    '<strong>$1</strong>'
  );

  return `<${tagName}>${newContent}</${tagName}>`; // Correct HTML reconstruction
}