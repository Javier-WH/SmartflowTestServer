
/* eslint-disable @typescript-eslint/no-explicit-any */
const insertGuidedCheckList = function (this: { quill: any }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  // Valores iniciales sin diálogo
  const initialItem = {
    id: crypto.randomUUID(),
    text: "Nuevo elemento", // Texto predeterminado
    guidande: "",
    index: 0
  };

  this.quill.insertEmbed(selection.index, 'guided-checklist', {
    title: "Nueva lista",
    items: [initialItem] // Pasa el array directamente
  });
};
export default insertGuidedCheckList;