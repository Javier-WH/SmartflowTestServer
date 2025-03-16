/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListItem } from '@/modules/page/components/guidedCheckList/guidedCheckList';
import { Quill } from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

class GuidedCheckListBlot extends BlockEmbed {
  static blotName = 'guided-checklist';
  static tagName = 'guided-checklist';
  static className = 'guided-checklist-block';

  static create(value: { title: string; items: ListItem[] }) {
    const node = super.create();
    
    // Guardar los datos como atributos de forma estructurada
    node.setAttribute('title', value.title);
    node.setAttribute('items', JSON.stringify(value.items));
    
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

