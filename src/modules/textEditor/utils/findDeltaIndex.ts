/**
 * Given the src of an image, return the index at which it occurs in the editor.
 * Returns -1 if the image is not found.
 * @param {{srcToFind: string, editor: import('react-quill').Quill}} options
 * - `srcToFind`: the src of the image to search for
 * - `editor`: the quill editor object
 * @returns {number} the index of the image in the editor, or -1 if not found
 */
const findImageIndexBySrc = ({srcToFind, editor}) => {
  if (!editor) {
    return -1;
  }
  const delta = editor.getContents();
  let currentPosition = 0;

  for (const op of delta.ops) {
    if (op.insert && typeof op.insert === 'object') {
      if (op.insert.image === srcToFind) {
        return currentPosition;
      }
    }

    if (typeof op.insert === 'string') {
      currentPosition += op.insert.length;
    } else if (op.insert) {
      currentPosition += 1;
    }
  }
  return -1;
};

export {findImageIndexBySrc};