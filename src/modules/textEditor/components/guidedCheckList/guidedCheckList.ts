
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const insertGuidedCheckList = function (this: { quill: any }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  const initialItem = {
    id: crypto.randomUUID(),
    text: "",
    guidande: "",
    index: 0
  };

  this.quill.insertEmbed(selection.index, 'guided-checklist', {
    title: "Nueva lista",
    items: JSON.stringify([initialItem])
  });
};

export default insertGuidedCheckList;