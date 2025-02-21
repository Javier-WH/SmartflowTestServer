import { PageItem } from "../../types/pageTypes";
import { Button, Popover, Collapse, Input } from "antd"
const { TextArea } = Input;
import { CiTrash } from "react-icons/ci";
import { PageContext, PageContextValues } from "../../page";
import { useContext, useEffect, useState, } from "react";
import styles from "../../page.module.css"



export default function HelpBlockComponent({ item }: { item: PageItem }) {
  const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues;
  const [color, setColor] = useState<'collapseBlue' | 'collapseYellow' | 'collapseRed' | 'collapseGreen' | 'collapseGray'>('collapseBlue');
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');



  useEffect(() => {
    if (item) {
      setTitle(item.text || '');
      setContent(item.listItems?.[0] || '');
      setColor(item.backgroundColor || 'collapseBlue');
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    updateContext();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [color]);

  const updateContext = () => {
    const updatedContent = pageContent.map(pageItem =>
      pageItem.id === item.id ? { ...pageItem, text: title, listItems: [content], backgroundColor: color } : pageItem
    );
    setPageContent(updatedContent);
  };


  const onDelete = async () => {
    const pageContentCopy = await JSON.parse(JSON.stringify(pageContent));
    const index = pageContentCopy.findIndex((pageItem: PageItem) => pageItem.id === item.id);
    pageContentCopy.splice(index, 1);
    setPageContent(pageContentCopy);
  }



  const popContent = () => {
    return <div className={styles.intemPopover}>
      <div style={{ display: "flex", gap: "5px" }}>

        <Popover content={<span style={{ color: "white" }}>Make blue</span>} color="var(--folderTextColor)">
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            className={styles.collapseBlue}
            onClick={() => setColor('collapseBlue')}
          >
          </div>
        </Popover>

        <Popover content={<span style={{ color: "white" }}>Make Yellow</span>} color="var(--folderTextColor)">
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            className={styles.collapseYellow}
            onClick={() => setColor('collapseYellow')}
          >
          </div>
        </Popover>

        <Popover content={<span style={{ color: "white" }}>Make Red</span>} color="var(--folderTextColor)">
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            className={styles.collapseRed}
            onClick={() => setColor('collapseRed')}
          >
          </div>
        </Popover>

        <Popover content={<span style={{ color: "white" }}>Make Green</span>} color="var(--folderTextColor)">
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            className={styles.collapseGreen}
            onClick={() => setColor('collapseGreen')}
          >
          </div>
        </Popover>

        <Popover content={<span style={{ color: "white" }}>Make Gray</span>} color="var(--folderTextColor)">
          <div
            style={{
              width: "20px",
              height: "20px",
              cursor: "pointer"
            }}
            className={styles.collapseGray}
            onClick={() => setColor('collapseGray')}
          >
          </div>
        </Popover>
      </div>

      <Popover content={<span style={{ color: "white" }}>Delete this checkbox</span>} color="var(--folderTextColor)">
        <Button icon={<CiTrash />} onClick={onDelete} />
      </Popover>
    </div>

  }

  const inputStyle: React.CSSProperties = {  
    direction: "ltr",
    border: "none",
  }


  return (
    <Popover content={popContent()} color="var(--pageBarColor)"  >
      <div onClick={e => e.stopPropagation()}>
        <Collapse
          className={styles[color]}
          size="large"
          items={[{ key: '1', label: 
          <Input placeholder="A title for your help content" onBlur={updateContext} value={title} onChange={e => setTitle(e.target.value)} onClick={e => e.stopPropagation()} style={inputStyle} />, 
          children: 
          <TextArea onBlur={updateContext} value={content} onChange={e => setContent(e.target.value)} style={inputStyle} rows={4} />  }]}
          defaultActiveKey={['1']}
        />
      </div>
    </Popover>
  );
}