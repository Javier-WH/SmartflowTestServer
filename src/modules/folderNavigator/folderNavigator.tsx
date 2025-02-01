import { FolderNavigatorProvider } from "./context/folderNavigatorContext";
import Browser from "./core/browser";


export default function FolderNavigator() {

  return (
    <FolderNavigatorProvider>
      <Browser />
    </FolderNavigatorProvider>
  );
}