import type { SearchBoxInterface } from "../types/searchBox"
import unPublishedFile from '../../folderNavigator/assets/svg/unPublishedFile.svg'
import folderIcon from '../../folderNavigator/assets/svg/closed_folder.svg'
import { useNavigate } from "react-router-dom";

export default function SearchBox({ data, word, closeBox }: { data: SearchBoxInterface[], word: string, closeBox: () => void }) {
  const hasResults = data.length > 0 && word.length > 0;
  const navigate = useNavigate();


  const handleClick = (id: string, type: number) =>{
    
    if (type === 1){
      const pageType = import.meta.env.VITE_PAGE_TYPE;
      if (pageType === 'quill') {
        navigate(`/textEditor/${id}`);
      } else {
        navigate(`/page/${id}`)
      }
    }
    
    closeBox()
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