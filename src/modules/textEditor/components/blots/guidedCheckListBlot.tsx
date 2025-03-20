/* eslint-disable @typescript-eslint/no-explicit-any */

import { Quill } from 'react-quill';

interface ListItem {
  text: string;
  checked: boolean;
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any, react-refresh/only-export-components
const BlockEmbed: any = Quill.import('blots/block/embed');

export default class GuidedCheckListBlot extends BlockEmbed {
  static blotName = 'guided-checklist';
  static tagName = 'guided-checklist';

  static create(values: { title: string; items: ListItem[] }) {
    const node = super.create();
    node.setAttribute('title', values.title);
    node.setAttribute('items', JSON.stringify(values.items));
    return node;
  }

  static value(domNode: HTMLElement) {
    return {
      title: domNode.getAttribute('title') || '',
      items: JSON.parse(domNode.getAttribute('items') || '[]')
    };
  }
}



