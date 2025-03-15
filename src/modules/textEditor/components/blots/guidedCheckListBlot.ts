/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quill } from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

class GuidedCheckListBlot extends BlockEmbed {
  static blotName = 'guided-checklist';
  //static tagName = 'guided-checklist-component';
  static tagName = 'guided-checklist';
  static className = 'guided-checklist-block';

  static create(value: { title: string; items: any[] }) {
    const node = super.create();
    // Falta establecer la estructura HTML del componente
    node.innerHTML = `<guided-checklist 
      title="${value.title}" 
      items='${JSON.stringify(value.items)}'
    ></guided-checklist>`;
    return node;
  }


  static value(node: HTMLElement) {
    return {
      title: node.getAttribute('title') || '',
      items: JSON.parse(node.getAttribute('items') || '[]')
    };
  }
}

export default GuidedCheckListBlot;

