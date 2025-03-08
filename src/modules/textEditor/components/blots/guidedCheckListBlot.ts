import { Quill } from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

class GuidedCheckListBlot extends BlockEmbed {
  static blotName = 'guided-checklist-block';
  static tagName = 'guided-checklist-component';
  static className = 'guided-checklist-block';

  static create(value: { title: string; content: string }) {
    const node = super.create();

    node.innerHTML = `
      <span slot="title">${value.title}</span>
      <div slot="content">${value.content}</div>
    `;

    return node;
  }


  static value(node: HTMLElement) {
    return {
      title: node.querySelector('[slot="title"]')?.textContent,
      content: node.querySelector('[slot="content"]')?.innerHTML
    };
  }
}

export default GuidedCheckListBlot;



class GuidedCheckListBlock extends HTMLElement {
  private listElement: HTMLUListElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    
    const shadowStyles = `<style>
      :host {
        display: block;
        width: 100%;
      }
      *,
      *::before,  
      *::after {
        box-sizing: border-box;
      }
  
      .guided-checklist-block-container {
      box-sizing: border-box;
        margin: 0px;
        padding: 0px;
        max-width: 100%;
        border: 1px solid #136a8a;
      }
      
      .drag-sort-enable {
        margin: 0;
        padding: 0;
        list-style: none; 
      }
      
      .list-item {
        margin: 5px 0;
        padding: 0 20px;
        height: 40px;
        line-height: 40px;
        border-radius: 3px;
        background: #136a8a;
        background: linear-gradient(to right, #267871, #136a8a);
        color: #fff;
        list-style: none;
        cursor: move;
        user-select: none;
      }
      
      .list-item.drag-sort-active {
        background: transparent;
        color: transparent;
        border: 1px solid #4ca1af;
      } 
      </style>`


    const shadowComponet = `    
      <div class="guided-checklist-block-container">
          <ul class="drag-sort-enable">
            <li class="list-item">Etiqueta 1</li>
            <li class="list-item">Etiqueta 2</li>
            <li class="list-item">Etiqueta 3</li>
            <li class="list-item">Etiqueta 4</li>
            <li class="list-item">Etiqueta 5</li>
          </ul>
      </div>
    `


    shadow.innerHTML = shadowStyles + shadowComponet.replace(/>\s+</g, '><').trim();
    this.listElement = shadow.querySelector('.drag-sort-enable')!;
    this.enableDragSort();
    
  }


  private enableDragSort() {
    Array.from(this.listElement.children).forEach(item => {
      this.enableDragItem(item as HTMLElement);
    });
  }

  private enableDragItem(item: HTMLElement) {
    item.setAttribute('draggable', 'true');

    item.ondragstart = (e) => {
      item.classList.add('drag-sort-active');
      e.dataTransfer?.setData('text/plain', '');
    };

    item.ondragover = (e) => {
      e.preventDefault();

      const afterElement = this.getDragAfterElement(e.clientY);
      const draggable = this.shadowRoot?.querySelector('.drag-sort-active');

      if (draggable && afterElement?.element) {
        this.listElement.insertBefore(draggable, afterElement.element);
      } else if (draggable) {
        this.listElement.appendChild(draggable);
      }
    };

    item.ondragend = () => {
      item.classList.remove('drag-sort-active');
    };
  }

  private getDragAfterElement(y: number) {
    const draggableElements = Array.from(this.listElement.children)
      .filter(item => !item.classList.contains('drag-sort-active'));

    return draggableElements.reduce((closest: { offset: number, element: Element | null }, child) => {
      const box = child.getBoundingClientRect();
      const offset = y - box.top - box.height / 2;

      if (offset < 0 && offset > closest.offset) {
        return { offset: offset, element: child };
      } else {
        return closest;
      }
    }, { offset: Number.NEGATIVE_INFINITY, element: null });
  }
}
if (!customElements.get('guided-checklist-component')) {
  customElements.define('guided-checklist-component', GuidedCheckListBlock);
}

