
/* eslint-disable @typescript-eslint/no-explicit-any */

const insertGuidedCheckList = function (this: { quill: any }) {
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
};

export default insertGuidedCheckList;