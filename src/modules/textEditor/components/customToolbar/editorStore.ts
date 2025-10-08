/* eslint-disable @typescript-eslint/no-explicit-any */
let activeEditor: any  = null;

export const setActiveEditor = (editor: any) => {
  activeEditor = editor;
};

export const getActiveEditor = () => activeEditor;