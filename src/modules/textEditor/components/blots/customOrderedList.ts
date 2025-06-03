import { Quill } from 'react-quill';


const List = Quill.import('formats/list');

class CustomOrderedList extends List {
  static blotName = 'list';
  static tagName = ['OL', 'UL'];
  static ORDERED_TAG = 'OL';

static create(  value: string | number) {
    // this validations must be done before calling super.create because fix a bug of bulletlist and checklist
    const type = typeof value === 'number'
      ? "ordered"
      : (value as string);
    const node = super.create(type) as HTMLElement;

    if (typeof value === 'number') {
      if (typeof value === 'number') {
        node.setAttribute('data-start', value.toString());
        node.style.counterReset = `quill-list-counter ${value - 1}`;
      }
    }

    return node;
  }

  static formats(domNode: HTMLElement) {
    const tagName = domNode.tagName;
    if (tagName === CustomOrderedList.ORDERED_TAG) {
      const start = domNode.getAttribute('data-start');
      return start ? parseInt(start, 10) : 'ordered';
    }
    return super.formats(domNode);
  }
}

export default CustomOrderedList;