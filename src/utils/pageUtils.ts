export function getParentFoldersForFile(fileId) {
  
  const targetFile = document.getElementById(fileId);

  if (!targetFile) return [];

  const folders = [];
  let currentElement: HTMLElement = targetFile;

  while (currentElement) {
    const ml5Div = currentElement.closest('.ml-5');
    if (!ml5Div) break;

    const folderDiv = ml5Div.previousElementSibling;
    if (folderDiv && folderDiv.classList.contains('folder') && folderDiv.classList.contains('opened')) {
      const nameSpan = folderDiv.querySelector('.folder-name');
      if (nameSpan) folders.unshift(nameSpan.textContent);
    }
    currentElement = folderDiv as HTMLElement;
  }

  return folders;
}