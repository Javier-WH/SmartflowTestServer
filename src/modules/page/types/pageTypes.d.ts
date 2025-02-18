import { PageType, Mode } from "./pageEnums";
export interface PageItem {
  id: string;
  type: PageType;
  text?: string;
  src?: string;
  styles: React.CSSProperties;
  mode: Mode;
  listType?: "ordered" | "unordered";
  listItems?: string[];
  checkedItems?: boolean[];
  backgroundColor?: "blue" | "yellow" | "red" | "green" | "gray"
}


/*
{
      id: uuidv4(),
      type: PageType.Image,
      src: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      styles: {
        width: "100px",
        height: "100px",
        float: "left",
        display: "block",
        margin: "0 auto",
      },
      mode: Mode.Edit
    },
    {
      id: uuidv4(),
      type: PageType.Text,
      text: "Hello absworld Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello world Hello worldHello world Hello world Hello world Hello world Hello world Hello world Hello world",
      styles: {
        width: "100%",
        height: "100%"
      },
      mode: Mode.Edit
    },
    {
      id: uuidv4(),
      type: PageType.Image,
      src: "https://images.pexels.com/photos/20787/pexels-photo.jpg?auto=compress&cs=tinysrgb&w=1260&h=750&dpr=1",
      styles: {
        width: "100px",
        height: "100px",
        float: "none",
        display: "block",
        margin: "0 auto",
        
      },
      mode: Mode.Edit
    },
    
  ]

*/