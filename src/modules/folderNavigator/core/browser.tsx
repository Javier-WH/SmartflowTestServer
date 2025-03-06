import FolderContainer from "../componets/folderContainer";
import { MainContext, MainContextValues } from "@/modules/mainContext";
import { useContext } from "react";
export default function Browser() {

  const { rootFolder } = useContext(MainContext) as MainContextValues

  return (
    <div className="main-folder-container">
      <div className="folder-container">
        <FolderContainer folderId={rootFolder} />
      </div>
    </div>

  );
}