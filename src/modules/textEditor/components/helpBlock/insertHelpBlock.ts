type QuillInstance = {
  getSelection: () => { index: number };
  insertEmbed: (index: number, blotName: string, content: string) => void;
  setSelection: (index: number) => void;
};

export default function insertHelpBlock(this: { quill: QuillInstance }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  const position = selection.index;
  

  this.quill.insertEmbed(
    position,
    'help-block',
    `<details>
      <summary> Some details </summary>
      <p> More info about the details. </p>
    </details>`
  );

  this.quill.setSelection(position + 1);
}