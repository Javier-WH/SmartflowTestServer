import { useEffect, useState, useContext } from "react";
import { message, Tag } from "antd";
import { Folder } from "../types/folder";
import { File, getFilesResponse } from "../types/file";
import { ContainerElement } from "../types/componets";
import useFolderManager from "../hooks/useFolderManager";
import useFilesManager from "../hooks/useFileManager";
import { FolderComponent } from "./folderComponent";
import { FileComponent } from "./fileComponent";
import { FolderNavigatorContext } from "../context/folderNavigatorContext";
import { FolderNavigatorContextValues } from "../types/folder";



export default function FolderContainer({ folderId }: { folderId: string | null}) {

  const {Loading, setLoading} = useContext(FolderNavigatorContext) as FolderNavigatorContextValues

  const { getFolders } = useFolderManager()
  const { getFiles }: { getFiles: getFilesResponse } = useFilesManager()
  const [content, setContent] = useState<ContainerElement[] | null>([])


  // eslint-disable-next-line react-hooks/exhaustive-deps
  const fetchData = async () => {
    setLoading(folderId)
    const response = await getFolders(folderId)
    if (response.error) {
      message.error(response.message)
      return
    }
    
    const newFolders: ContainerElement[] = (response.data ?? []).map((folder: Folder) => {
      return {
        id: folder.id ?? "",
        type: 1,
        name: folder.name,
        container: folder.container ?? null
      }
    })
    
    const newFiles: ContainerElement[] = ((await getFiles(folderId)).data ?? []).map((file: File) => {
      return {
        id: file.id ?? "",
        type: 0,
        name: file.name,
        container: file.container ?? null,
        content: file.content,
        published: file.published
      }
      
    })
    setContent([...newFolders, ...newFiles])
    setLoading(null)
  }

  useEffect(() => {
    if(folderId === "x") return
    fetchData()
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId])

 
  if (content?.length === 0) {
    if(Loading === folderId) return <Tag >Loading...</Tag>
    return <Tag >Empty Folder</Tag>
  }

  return <div>

    {
      content?.map((item) => {
        return <div
          key={item.id}
        >
          {
            item.type === 1
              ? <FolderComponent folder={item} containerid={folderId} />
              : <FileComponent file={item} containerid={folderId} />
       
          }

        </div>
      })
    }
  </div>

}