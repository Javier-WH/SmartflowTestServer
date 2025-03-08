type QuillInstance = {
  getSelection: () => { index: number };
  insertEmbed: (index: number, blotName: string, content: { title: string; content: string }) => void;
  setSelection: (index: number) => void;
};

export default function insertGuidedCheckList(this: { quill: QuillInstance }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  const position = selection.index;
  

  this.quill.insertEmbed(
    position,
    'guided-checklist-block',
    {
      title: 'Título del collapsible',
      content: '<p>Contenido del collapsible...</p>'
    }
  );

  this.quill.setSelection(position + 1);
}