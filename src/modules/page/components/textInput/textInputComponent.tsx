import { PageItem } from "../../types/pageTypes";
import { Button, Popover, Input } from "antd"
const { TextArea } = Input;
import { CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext, useEffect, useState } from "react";
import styles from "../../page.module.css"
import { BsTextareaResize } from "react-icons/bs";
import { LuTextCursorInput } from "react-icons/lu";


export default function TextInputComponent({ item }: { item: PageItem }) {

  const { pageContent, setPageContentPromise } = useContext(PageContext) as PageContextValues
  const [rows, setRows] = useState(5);
  const [questionValue, setQuestionValue] = useState("");



  useEffect(() => {
    setQuestionValue(item.text || "");
    setRows(item.rows || 5);
  }, [item.text, item.rows]);

 

  const updateContext = () => {
    const updatedContent = pageContent.map(pageItem =>
      pageItem.id === item.id ? { ...pageItem, text: questionValue, rows } : pageItem
    );
    setPageContentPromise(updatedContent);
  };

  const onDelete = async() => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContentPromise(pageContentCopy);
  }


  const popContent = () => {
    return <div className={styles.intemPopover} onBlur={updateContext}>
      <Popover content={<span style={{ color: "white" }}>Single line input</span>} color="var(--folderTextColor)">
        <Button icon={<LuTextCursorInput />} onClick={() => setRows(1)} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Multiline input</span>} color="var(--folderTextColor)">
        <Button icon={<BsTextareaResize />} onClick={() => setRows(5)} />
      </Popover>
      <Popover content={<span style={{ color: "white" }}>Delete this input field</span>} color="var(--folderTextColor)">
        <Button icon={<CiTrash />} onClick={onDelete} />
      </Popover>
    </div>

  }

  return <>
    <Popover content={popContent()} color="var(--pageBarColor)">
      <div className={styles.textInputContainer} onClick={e => e.stopPropagation()}>
        <Input 
          placeholder="Ask a question"
          style={{border: "none", outline: "none !important"}}
          value={questionValue}
          onChange={e => setQuestionValue(e.target.value)}
          onBlur={updateContext}
        />
        <TextArea 
        className={styles.inputTextArea}
          rows={rows}
          readOnly = {item.mode === 'edit'}
          style={{borderRadius: "0px", resize: "none"}}
        />
      </div>
    </Popover>
  </>
}