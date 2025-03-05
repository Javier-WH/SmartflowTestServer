import type { SearchBoxInterface } from "../types/searchBox"
import unPublishedFile from '../../folderNavigator/assets/svg/unPublishedFile.svg'
import folderIcon from '../../folderNavigator/assets/svg/closed_folder.svg'

export default function SearchBox({ data, word }: { data: SearchBoxInterface[], word: string }) {
  const hasResults = data.length > 0 && word.length > 0;

  const handleClick = (id: string, type: number) =>{
      console.log({id, type})
  
  }

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
  if (!searchWord) return null;

  // Configurar el parser y excluir tags no deseados
  const parser = new DOMParser();
  const doc = parser.parseFromString(htmlString, 'text/html');
  const excludedTags = new Set(['IMG', 'IFRAME', 'SCRIPT', 'STYLE', 'NOSCRIPT']);

  // Crear un TreeWalker para buscar en los nodos de texto
  const treeWalker = doc.createTreeWalker(
    doc.body,
    NodeFilter.SHOW_TEXT,
    {
      acceptNode(node) {
        let parent = node.parentElement;
        while (parent) {
          if (excludedTags.has(parent.tagName)) {
            return NodeFilter.FILTER_REJECT;
          }
          parent = parent.parentElement;
        }
        return NodeFilter.FILTER_ACCEPT;
      }
    }
  );

  // Buscar la primera coincidencia
  while (treeWalker.nextNode()) {
    const textNode = treeWalker.currentNode as Text;
    const textContent = textNode.textContent || '';
    const lowerContent = textContent.toLowerCase();
    const lowerSearch = searchWord.toLowerCase();
    const matchIndex = lowerContent.indexOf(lowerSearch);

    if (matchIndex !== -1) {
      // Encontramos una coincidencia, procesar
      const parentElement = textNode.parentElement!;

      // Crear nuevo contenido con el texto resaltado
      const before = textContent.slice(0, matchIndex);
      const match = textContent.slice(matchIndex, matchIndex + searchWord.length);
      const after = textContent.slice(matchIndex + searchWord.length);

      // Reemplazar el nodo de texto original
      const fragment = document.createDocumentFragment();
      fragment.append(
        document.createTextNode(before),
        Object.assign(document.createElement('strong'), { textContent: match }),
        document.createTextNode(after)
      );

      parentElement.replaceChild(fragment, textNode);

      return parentElement.outerHTML;
    }
  }

  return null;
}