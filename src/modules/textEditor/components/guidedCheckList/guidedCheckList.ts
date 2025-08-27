
/* eslint-disable @typescript-eslint/no-explicit-any */

const insertGuidedCheckList = function (this: { quill: any}) {
  const selection = this.quill.getSelection();
  if (!selection || !this.quill.root.isConnected) return;

  const initialItem = {
    id: crypto.randomUUID(),
    index: 0,
    text: "",
    guidande: ""
  };

  this.quill.insertEmbed(selection.index, 'guided-checklist', {
    title: "",
    items: [initialItem] 
  });

 // Move cursor to the next line after the checklist and insert a new line
  this.quill.insertText(selection.index + 1, '\n');
  this.quill.setSelection(selection.index + 2, 0);
};

export default insertGuidedCheckList;