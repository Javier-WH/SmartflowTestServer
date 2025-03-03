import {Quill} from 'react-quill';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const BlockEmbed: any = Quill.import('blots/block/embed');

class HelpBlockBlot extends BlockEmbed {
  static blotName = 'help-block';
  static tagName = 'div';
  static className = 'help-block';

  static create(value: string) {
    const node: HTMLDivElement = super.create();
    node.classList.add(HelpBlockBlot.className);
    node.innerHTML = value;
    return node;
  }

  static value(node: HTMLDivElement) {
    return node.innerHTML;
  }
}

export default HelpBlockBlot;