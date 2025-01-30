import { ContainerElement } from "../types/componets";
import publishedIcon from '../assets/svg/publishedFile.svg'
import unPublishedIcon from '../assets/svg/unPublishedFile.svg'
import "./folderContainer.css"


export function FileComponent({ file }: { file: ContainerElement }) {
  const handleClick = (id: string) => {
    console.log(id)
  }

  return <div>
    <div
      style={{ display: 'flex', alignItems: 'center', gap: 10 }}
      onClick={() => handleClick(file.id)}
      className="folder"
    >
      <img src={file.published ? publishedIcon : unPublishedIcon} alt="" width={30} />
      <span>{file.name}</span>
    </div>
  </div>
}