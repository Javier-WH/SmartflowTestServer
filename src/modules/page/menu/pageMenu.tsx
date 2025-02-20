import addImageIcon from "./assets/svg/addImageIcon.svg"
import addBulletListIcon from "./assets/svg/addBulletListIcon.svg"
import addNumberListIcon from "./assets/svg/addNumberedListIcon.svg"
import addHelpBlockIcon from "./assets/svg/addHelpBlockIcon.svg"
import addCheckboxIcon from "./assets/svg/addCheckBoxIcon.svg"
import addMultipleChoiceIcon from "./assets/svg/addMultipleChoisesIcon.svg"
import addTextInputIcon from "./assets/svg/addTextInputIcon.svg"
import addGuidedChecklistIcon from "./assets/svg/addGuidedCheckList.svg"
import VideoModal from "./videoModal/videoModal"
import { Button, Popover } from "antd"
import { PageContext, PageContextValues } from "../page"
import { useContext, useRef } from "react"
import { v4 as uuidv4 } from 'uuid';
import { Mode, PageType } from "../types/pageEnums"
import { PageItem } from "../types/pageTypes"
import styles from "../page.module.css"

export default function PageMenu() {

  const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues
  const inputFileRef = useRef<HTMLInputElement>(null);

  const handleAddImage = () => {
    if (inputFileRef.current) {
      inputFileRef.current.click();
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    if (file) {
      const reader = new FileReader();

      reader.onload = (e: ProgressEvent<FileReader>) => {
        const src = e.target?.result as string;

        const imageItem: PageItem = {
          id: uuidv4(),
          type: PageType.Image,
          src: src,
          styles: {
            width: "100%",
            height: "auto",
            float: "none",
            display: "block",
            margin: "0 auto",
          },
          mode: Mode.Edit,
        };
        const pageContentCopy = [...pageContent];

        const textItem: PageItem = {
          id: uuidv4(),
          type: PageType.Text,
          text: "",
          styles: {
            width: "100%",
            float: "none",
            display: "block"
          },
          mode: Mode.Edit
        }
        pageContentCopy.push(imageItem);
        pageContentCopy.push(textItem);
        setPageContent(pageContentCopy);
        // Clear the input after using the file
        if (inputFileRef.current) {
          inputFileRef.current.value = '';
        }
      };

      reader.readAsDataURL(file);
    }
  };

  const addList = async (listType: "ordered" | "unordered") => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const newList: PageItem = {
      id: uuidv4(),
      type: PageType.List,
      text: "",
      listType,
      listItems: [""],
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(newList);
    setPageContent(pageContentCopy);
  }

  const addCheckBox = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const newList: PageItem = {
      id: uuidv4(),
      type: PageType.CheckBox,
      text: "",
      listItems: ["  "],
      checkedItems: [true],
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(newList);
    setPageContent(pageContentCopy);
  }

  const addHelpBlock = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const newList: PageItem = {
      id: uuidv4(),
      type: PageType.HelpBlock,
      text: "",
      listItems: [""],
      backgroundColor: 'blue',
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(newList);
    const textItem: PageItem = {
      id: uuidv4(),
      type: PageType.Text,
      text: "",
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(textItem);

    setPageContent(pageContentCopy);
  }

  const addMultipleChoises = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const newList: PageItem = {
      id: uuidv4(),
      type: PageType.MultipleChoises,
      text: "",
      listItems: [""],
      checkedItems: [false],
      checkType: "radio",
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(newList);

    const textItem: PageItem = {
      id: uuidv4(),
      type: PageType.Text,
      text: "",
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(textItem);
    setPageContent(pageContentCopy);
  }

  const addInputText = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const textInputItem: PageItem = {
      id: uuidv4(),
      type: PageType.TextInput,
      text: "",
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(textInputItem);
    setPageContent(pageContentCopy);

    const textItem: PageItem = {
      id: uuidv4(),
      type: PageType.Text,
      text: "",
      styles: {
        width: "100%",
        float: "none",
        display: "block"
      },
      mode: Mode.Edit
    }
    pageContentCopy.push(textItem);
    setPageContent(pageContentCopy);
  }


return <div className={styles.buttonBar}>
  <Popover content={<span style={{ color: "white" }}>Add image</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addImageIcon} />} onClick={handleAddImage} />
    <input
      type="file"
      ref={inputFileRef}
      style={{ display: 'none' }}
      onChange={handleFileChange}
      accept="image/*"
    />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add video</span>} color="var(--pageBarColor)">
    <div style={{ display: "flex", alignItems: "center" }}><VideoModal /></div>
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add bullet list</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addBulletListIcon} onClick={() => addList("unordered")} />} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add numbered list</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addNumberListIcon} onClick={() => addList("ordered")} />} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add help block</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addHelpBlockIcon} />} onClick={addHelpBlock} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add checkbox</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addCheckboxIcon} onClick={() => addCheckBox()} />} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add multiple choice input</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addMultipleChoiceIcon} />} onClick={addMultipleChoises} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add text input</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addTextInputIcon} onClick={addInputText} />} />
  </Popover>
  <Popover content={<span style={{ color: "white" }}>Add guided checklist</span>} color="var(--pageBarColor)">
    <Button type="primary" icon={<img src={addGuidedChecklistIcon} />} />
  </Popover>
</div>;
}

// hsla(211, 39%, 23%, var(--tw-bg-opacity))