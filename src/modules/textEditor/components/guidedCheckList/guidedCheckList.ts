
/* eslint-disable @typescript-eslint/no-explicit-any */
const insertGuidedCheckList = function (this: { quill: any }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  const initialItem = {
    id: crypto.randomUUID(),
    text: "New item", 
    guidande: "",
    index: 0
  };

  this.quill.insertEmbed(selection.index, 'guided-checklist', {
    title: "Nueva lista",
    items: [initialItem] 
  });
};
export default insertGuidedCheckList;