import { useEffect, useState, useContext } from "react";
import { message, Tag } from "antd";
import { FolderRequestItem } from "../types/folder";
import { ContainerElement } from "../types/componets";
import useFolderManager from "../hooks/useFolderManager";
import { FolderComponent } from "./folderComponent";
import { FileComponent } from "./fileComponent";
import { FolderNavigatorContext } from "../context/folderNavigatorContext";
import { FolderNavigatorContextValues } from "../types/folder";



export default function FolderContainer({ folderId }: { folderId: string | null }) {

  const { Loading, setLoading, updateFolderRequest } = useContext(FolderNavigatorContext) as FolderNavigatorContextValues
  const { getFolderContent, getRootContent } = useFolderManager()
  
  const [content, setContent] = useState<ContainerElement[] | null>([])


  // eslint-disable-next-line react-hooks/exhaustive-deps
 

  useEffect(() => {
    async function getContent() {
      setLoading(folderId)
      const response = await getFolderContent(folderId)
      if (response.error) {
        message.error(response.message)
        return
      }
      
      const newData = response.data ?? []
      const newContent = newData.map((item: ContainerElement) => {
        return {
          id: item.id ?? "",
          type: item.type,
          name: item.name,
          container: null,
          published: item.published
        }
      })
      setContent(newContent)
      setLoading(null)

    }
    getContent()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [folderId])


  async function getRoot() {
    const response = await getRootContent()
    if (response.error) {
      message.error(response.message)
      return
    }
    const newItems = response.data?.map((item: ContainerElement) => {
      return {
        id: item.id ?? "",
        type: item.type as 0 | 1,
        name: item.name,
        container: null,
        published: item.published
      }
    })
    //console.log(newItems)
    setContent(newItems ?? [])
  }

  // on move folder
  useEffect(() => {
    //console.log(updateFolderRequest)
    if(!folderId) {
      getRoot()
    }

    if (!updateFolderRequest) return
    const keys = Object.keys(updateFolderRequest)
    if (!keys.includes(folderId ?? "")) {
      return
    }

    const newData = updateFolderRequest[folderId ?? ""]

    const newFolders = newData.map((item: FolderRequestItem) => {
      return {
        id: item.id ?? "",
        type: item.type as 0 | 1,
        name: item.name,
        container: null,
        published: item.published
      }
    })
    setContent(newFolders)

  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [updateFolderRequest])


  if (content?.length === 0) {
    if (Loading === folderId) return <Tag >Loading...</Tag>
    return <Tag >Empty Folder</Tag>
  }
  

  return <div style={{display:"inline-block"}}>

    {
      content?.map((item) => {
        return <div
          key={item.id}
          style={{
            maxWidth: '250px'
          }}
        >
          {
            item.type === 1
              ? <FolderComponent folder={item} containerid={folderId} />
              : <FileComponent file={item} />

          }

        </div>
      })
    }
  </div>

}