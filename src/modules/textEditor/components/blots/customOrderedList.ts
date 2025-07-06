import { Quill } from 'react-quill';

const List = Quill.import('formats/list');

class CustomOrderedList extends List {
  static blotName = 'list';
  static tagName = ['OL', 'UL'];
  static ORDERED_TAG = 'OL';
  static ALPHA_TYPE = 'alpha';

  static create(value: string | number | 'alpha') {
    // Determina el tipo de lista
    const type = value === CustomOrderedList.ALPHA_TYPE ? 'alpha' :
      typeof value === 'number' ? 'ordered' :
        value;

    const node = super.create(type === 'alpha' ? 'ordered' : type) as HTMLElement;
    console.log(value)
    // Manejar listas numéricas con inicio personalizado
    if (typeof value === 'number') {
      node.setAttribute('data-start', value.toString());
      node.style.counterReset = `quill-list-counter ${value - 1}`;
    }

    // Manejar listas alfabéticas
    if (value === CustomOrderedList.ALPHA_TYPE) {
      node.style.listStyleType = 'lower-alpha';
      node.classList.add('ql-alpha-list');
    }

    return node;
  }

  static formats(domNode: HTMLElement) {
    const tagName = domNode.tagName;

    if (tagName === CustomOrderedList.ORDERED_TAG) {
      // Verificar si es lista alfabética
      if (domNode.style.listStyleType === 'lower-alpha' ||
        domNode.classList.contains('ql-alpha-list')) {
        return CustomOrderedList.ALPHA_TYPE;
      }

      // Mantener funcionalidad numérica existente
      const start = domNode.getAttribute('data-start');
      return start ? parseInt(start, 10) : 'ordered';
    }

    return super.formats(domNode);
  }
}

// Registra el blot personalizado
Quill.register(CustomOrderedList, true);

export default CustomOrderedList;