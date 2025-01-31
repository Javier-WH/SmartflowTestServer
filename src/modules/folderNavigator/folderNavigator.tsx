import FolderContainer from "./componets/folderContainer"
import { FolderNavigatorProvider } from "./context/folderNavigatorContext"

export default function FolderNavigator() {

  return (
    <FolderNavigatorProvider>
      <div>
        <FolderContainer folderId={null}/>
      </div>
    </FolderNavigatorProvider>
  )
}