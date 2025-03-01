// eslint-disable-next-line @typescript-eslint/no-explicit-any
export default function insertHelpBlock(this: { quill: any }) {

  const quill = this.quill;
  const cursorPosition = quill.getSelection().index;
  const customHTML = '<div>Aqui va el help block</div>'; 
  quill.clipboard.dangerouslyPasteHTML(cursorPosition, customHTML);
  quill.setSelection(cursorPosition + 1);
}