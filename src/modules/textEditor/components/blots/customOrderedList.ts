import { Quill } from 'react-quill';


const List = Quill.import('formats/list');

class CustomOrderedList extends List {
  static blotName = 'list';
  static tagName = ['OL'];
  static ORDERED_TAG = 'OL';

  static create(value: string | number) {
    const node = super.create(value) as HTMLElement;

    if ( typeof value === 'number') {
      node.setAttribute('start', value.toString());
    }

    return node;
  }

  static formats(domNode: HTMLElement) {
    const format = super.formats(domNode);

    if (format === 'ordered' && domNode.tagName === 'OL') {
      const start = domNode.getAttribute('start');
      return start ? parseInt(start, 10) : 'ordered';
    }

    return format;
  }
}

export default CustomOrderedList;