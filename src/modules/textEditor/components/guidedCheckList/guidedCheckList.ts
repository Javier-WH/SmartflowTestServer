
/* eslint-disable @typescript-eslint/no-explicit-any */

const insertGuidedCheckList = function (this: { quill: any }) {
  const selection = this.quill.getSelection();
  if (!selection) return;

  // Crear ítem inicial con estructura completa
  const initialItem = {
    id: crypto.randomUUID(),
    index: 0,
    text: "",
    guidande: ""
  };

  // Insertar con estructura correcta y serialización
  this.quill.insertEmbed(selection.index, 'guided-checklist', {
    title: "",
    items: [initialItem] 
  });
};

export default insertGuidedCheckList;