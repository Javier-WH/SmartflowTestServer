import { createContext, type ReactNode, useEffect, useState } from "react"
import type { Folder, FolderResquest } from "./folderNavigator/types/folder";
import useRoll, { MemberRolltype } from '@/modules/userRoll/useRoll';
import useAuth from '@/modules/auth/hooks/useAuth';
import { useParams } from 'react-router-dom';
import useGetOrganizationData from './navBar/hooks/useOrganizationData';

export interface MainContextValues {
  inPage: boolean,
  setInPage: React.Dispatch<React.SetStateAction<boolean>>,
  newFolderRequest: Folder | null,
  setNewFolderRequest: React.Dispatch<React.SetStateAction<Folder | null>>,
  updateFolderRequestFromMain: FolderResquest | null,
  setUpdateFolderRequestFromMain: React.Dispatch<React.SetStateAction<FolderResquest | null>>,
  rootFolder: string | null,
  setRootFolder: React.Dispatch<React.SetStateAction<string | null>>
  memberRoll: MemberRolltype | null,
  selectedFileId: string | null,
  setSelectedFileId: React.Dispatch<React.SetStateAction<string | null>>
  changleFileNameRequest: {fileId: string, fileName: string} | null,
  setChangleFileNameRequest: React.Dispatch<React.SetStateAction<{fileId: string, fileName: string} | null>>
  parentFolders: string, 
  setParentFolders: React.Dispatch<React.SetStateAction<string>>
}

export const MainContext = createContext<MainContextValues | null>(null);

export const MainContextProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { organization_id, slug } = useParams();
  const {getOrganizationBasicData} = useGetOrganizationData();
  const { user } = useAuth();
  const [inPage, setInPage] = useState(false);
  const [newFolderRequest, setNewFolderRequest] = useState<Folder | null>(null);
  const [updateFolderRequestFromMain, setUpdateFolderRequestFromMain] = useState<FolderResquest | null>(null);
  const [rootFolder, setRootFolder] = useState<string | null>(null);
  const [organizationId, setOrganizationId] = useState<string>('');
  const { memberRoll } = useRoll({userId: user?.id ?? '', organizationId: organizationId ?? ''});
  const [selectedFileId, setSelectedFileId] = useState<string | null>(null);
  const [changleFileNameRequest, setChangleFileNameRequest] = useState<{fileId: string, fileName: string} | null>(null);
  const [parentFolders, setParentFolders] = useState<string>('');


  

  //get organization name
  useEffect(() => {
    if (!organization_id && !slug) return;
    getOrganizationBasicData(organization_id ?? slug ?? '')
      .then(res => {
        setOrganizationId(res?.data[0]?.id ?? '');
      })
      .catch(err => {
        console.log(err);
        setOrganizationId('');
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [organization_id, slug])


  const values: MainContextValues = {
    inPage,
    setInPage,
    newFolderRequest,
    setNewFolderRequest,
    updateFolderRequestFromMain,
    setUpdateFolderRequestFromMain,
    rootFolder,
    setRootFolder,
    memberRoll,
    selectedFileId, 
    setSelectedFileId,
    changleFileNameRequest, 
    setChangleFileNameRequest,
    parentFolders, 
    setParentFolders
  }

  return (
    <MainContext.Provider value={values}>
      {children}
    </MainContext.Provider>
  )

}
