import {Quill} from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

class HelpBlockBlot extends BlockEmbed {
  static blotName = 'help-block';
  static tagName = 'collapsible-component';
  static className = 'help-block';

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

export default HelpBlockBlot;



class CollapsableHelpBlock extends HTMLElement {
  private isOpen: boolean = false;
  private collapseElement: HTMLElement;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.innerHTML = `
      <style>
        .collapse-content {
          padding: 15px;
          border: 1px solid #dedede;
          display: none;
        }
        .open .collapse-content {
          display: block;
        }
        button {
          padding: 8px 12px;
          cursor: pointer;
          background: #f0f0f0;
          border: 1px solid #ccc;
          border-radius: 4px;
          width: 100%;
        }
      </style>
      <div class="container">
        <button type="button" contenteditable="true">Toggle collapse</button>
        <div class="collapse-content">
          <slot name="content" contenteditable="true"></slot>
        </div>
      </div>
    `;

    this.collapseElement = shadow.querySelector('.collapse-content')!;
    const button = shadow.querySelector('button')!;
    button.addEventListener('click', () => this.toggle());
  }

  // 2. Añade el método toggle al componente
  toggle() {
    this.isOpen = !this.isOpen;
    this.collapseElement.style.display = this.isOpen ? 'block' : 'none';
    this.dispatchEvent(new CustomEvent('toggle', {
      detail: { isOpen: this.isOpen }
    }));
  }
}

customElements.define('collapsible-component', CollapsableHelpBlock);