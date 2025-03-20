/* eslint-disable @typescript-eslint/no-explicit-any */
import { ListItem } from '@/modules/page/components/guidedCheckList/guidedCheckList';
import { Quill } from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

export default class GuidedCheckListBlot extends BlockEmbed {
  static blotName = 'guided-checklist';
  static tagName = 'guided-checklist';
  static className = 'guided-checklist-block';

  static create(value: { title: string; items: ListItem[] }) {

    const node = super.create();

    // Guardar datos como atributos
    node.setAttribute('title', value.title);
    node.setAttribute('items', JSON.stringify(value.items));

    return node;
  }

  static formats(domNode: HTMLElement) {
    return {
      title: domNode.getAttribute('title') || '',
      items: JSON.parse(domNode.getAttribute('items') || '[]')
    };
  }

  static value(domNode: HTMLElement) {
    return this.formats(domNode);
  }

  format(name: string, value: any) {
    if (name === 'title' || name === 'items') {
      if (value) {
        this.domNode.setAttribute(name, name === 'items' ? JSON.stringify(value) : value);
      } else {
        this.domNode.removeAttribute(name);
      }
    } else {
      super.format(name, value);
    }
  }
}



