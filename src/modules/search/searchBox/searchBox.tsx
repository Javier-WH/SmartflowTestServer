import type { SearchBoxInterface } from "../types/searchBox"
import unPublishedFile from '../../folderNavigator/assets/svg/unPublishedFile.svg'
import folderIcon from '../../folderNavigator/assets/svg/closed_folder.svg'
import { useNavigate } from "react-router-dom";
import useFolderManager from "@/modules/folderNavigator/hooks/useFolderManager";
import groupDataByContainer from "../../folderNavigator/context/utils/groupDataByContainer";



export default function SearchBox({ data, word, closeBox }: { data: SearchBoxInterface[], word: string, closeBox: () => void }) {

  const { getHierarchyFolderContent } = useFolderManager()
  const hasResults = data.length > 0 && word.length > 0;
  const navigate = useNavigate();

  // Función waitFor: espera a que se cumpla la condición (por ejemplo, que el elemento exista en el DOM).
  function waitFor(
    conditionFn: () => boolean,
    timeout = 5000, // tiempo máximo de espera en milisegundos
    interval = 50   // intervalo entre comprobaciones en milisegundos
  ): Promise<void> {
    return new Promise((resolve, reject) => {
      const startTime = Date.now();
      const check = () => {
        if (conditionFn()) {
          resolve();
        } else if (Date.now() - startTime > timeout) {
          reject(new Error("Timeout: La condición no se cumplió"));
        } else {
          setTimeout(check, interval);
        }
      };
      check();
    });
  }

  const handleClick = async (id: string, type: number) => {
    if (type === 1) {
      const pageType = import.meta.env.VITE_PAGE_TYPE;
      if (pageType === "quill") {
        navigate(`/textEditor/${id}`);
      } else {
        navigate(`/page/${id}`);
      }
    } else if (type === 0) {
      try {
        const response = await getHierarchyFolderContent(id);
        if (response.error) {
          console.error(response.error);
          //message.error(response.message);
          return;
        }

        if (response.data) {
          const gruppedByContainer = groupDataByContainer({ data: response.data });
          const keys = Object.keys(gruppedByContainer);
   
          for (const [index, key] of keys.entries()) {
            // Obtenemos el elemento actual.
            const element = document.getElementById(key);
            if (element) {
              // Ejecutamos el click sobre el elemento actual.
             if(!element.classList.contains("opened")){
               element.click();
             }

              // Verificamos si existe un siguiente elemento en el array.
              const nextKey = keys[index + 1];
              if (nextKey !== undefined) {
                try {
                  // Esperamos a que el siguiente elemento exista en el DOM.
                  await waitFor(() => document.getElementById(nextKey) !== null, 5000, 50);
                } catch (error) {
                  console.error(`Timeout esperando que se renderice el elemento con id ${nextKey}:`, error);
                }
              }
            }
          }
        }
      } catch (error) {
        console.error("Error obteniendo el contenido de la carpeta:", error);
      }
    }

    closeBox();
  };


  return <div id="searchBox" style={{
    position: 'absolute',
    width: '100%',
    border: '1px solid #ccc',
    top: '100%',
    maxHeight: '250px',
    overflowY: 'auto',
    display: hasResults ? 'block' : 'none',
    backgroundColor: 'white',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
    zIndex: 1000,
  }}>
    {data.map((item) => {
      const htmlString = getSelectedText(word, item.content) || '';

      return <div
        onClick={() => handleClick(item.id, item.type)}
        key={item.id}
        style={{
          padding: '8px',
          cursor: 'pointer',
          borderBottom: '1px solid #eee',
          display: 'flex',
          alignItems: 'center',
          columnGap: '10px',
        }}
      >
        <img src={item.type === 1 ? unPublishedFile : folderIcon} alt="File icon" width={37} />
        <div style={{ flex: 1 }}>
          <div style={{
            fontSize: htmlString ? '12px' : '16px',
            fontWeight: 500
          }}>
            {item.name}
          </div>
          {htmlString &&
            <div
              style={{
                fontSize: '14px',
                color: '#666',
                lineHeight: '1.4',
              }}
              dangerouslySetInnerHTML={{ __html: htmlString }}
            />}
        </div>
      </div>
    })}
  </div>
}

function getSelectedText(searchWord: string, htmlString: string): string | null {
  if (!searchWord) return null

  const parser = new DOMParser()
  const doc = parser.parseFromString(htmlString, 'text/html')
  const excludedTags = new Set(['IMG', 'IFRAME', 'SCRIPT', 'STYLE', 'NOSCRIPT'])

  const treeWalker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        let parent = node.parentElement
        while (parent) {
          if (excludedTags.has(parent.tagName)) return NodeFilter.FILTER_REJECT
          parent = parent.parentElement
        }
        return NodeFilter.FILTER_ACCEPT
      }
    }
  )

  while (treeWalker.nextNode()) {
    const textNode = treeWalker.currentNode as Text
    const textContent = textNode.textContent || ''
    const lowerContent = textContent.toLowerCase()
    const matchIndex = lowerContent.indexOf(searchWord.toLowerCase())

    if (matchIndex !== -1) {
      const parent = textNode.parentElement!

      // clone and clean styles
      const cleanParent = parent.cloneNode(false) as HTMLElement
      cleanParent.style.cssText = 'font-size:inherit; line-height:inherit; margin:0; padding:0;'


      const fragment = document.createDocumentFragment()
      fragment.append(
        document.createTextNode(textContent.slice(0, matchIndex)),
        Object.assign(document.createElement('strong'), {
          textContent: textContent.slice(matchIndex, matchIndex + searchWord.length),
          style: 'font-size:inherit;'
        }),
        document.createTextNode(textContent.slice(matchIndex + searchWord.length))
      )

      cleanParent.appendChild(fragment)
      return cleanParent.outerHTML
    }
  }

  return null
}