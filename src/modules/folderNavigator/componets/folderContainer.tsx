import { useEffect, useState } from "react";
import { message, Tag, Spin} from "antd";
import { Folder, getFolderResponse } from "../types/folder";
import { File, getFilesResponse } from "../types/file";
import { ContainerElement } from "../types/componets";
import useFolderManager from "../hooks/useFolderManager";
import useFilesManager from "../hooks/useFileManager";
import { FolderComponent } from "./folderComponent";
import { FileComponent } from "./fileComponent";


export default function FolderContainer({ folderId }: { folderId: string | null }) {

  const { getFolders }: { getFolders: getFolderResponse } = useFolderManager()
  const { getFiles }: { getFiles: getFilesResponse } = useFilesManager()
  const [content, setContent] = useState<ContainerElement[] | null>([])
  const [loading, setLoading] = useState<boolean>(false)

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true)
      const response = await getFolders(folderId)
      if (response.error) {
        message.error(response.error)
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
      setLoading(false)
    }
    fetchData()

  }, [folderId, getFolders, getFiles])


  if(loading){
    return <div><Spin/>{` Loading`}</div>
  }

  if(content?.length === 0){
    return <Tag >Empty Folder</Tag>
  }

  return <div>
    {
      content?.map((item) => {

        return <div key={item.id}>
          {
            item.type === 1
              ? <FolderComponent folder={item} />
              : <FileComponent file={item} />
          }

        </div>
      })
    }
  </div>


}