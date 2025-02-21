import { v4 as uuidv4 } from 'uuid';
import { PageItem } from '../../types/pageTypes';
import { Mode, PageType } from '../../types/pageEnums';

export function getRawTextComponent() {
  const newTextContent: PageItem = {
    id: uuidv4(),
    type: PageType.Text,
    text: "",
    styles: {
      width: "100%",
      float: "none",
      display: "block",
    },
    mode: Mode.Edit
  }
  return newTextContent;
}

export function getRawImageComponent(src: string) {
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
  return imageItem;
}

export function getRawListComponent(listType: "ordered" | "unordered") {
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
  return newList;
}

export function getRawCheckBoxComponent() {
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
  return newList;
}

export function getRawHelpBlockComponent() {
  const newList: PageItem = {
    id: uuidv4(),
    type: PageType.HelpBlock,
    text: "",
    listItems: [""],
    backgroundColor: 'collapseBlue',
    styles: {
      width: "100%",
      float: "none",
      display: "block"
    },
    mode: Mode.Edit
  }
  return newList;
}

export function getRawMultipleChoisesComponent() {
  const newList: PageItem = {
    id: uuidv4(),
    type: PageType.MultipleChoises,
    text: "",
    listItems: [""],
    checkedItems: [false],
    checkType: "radio",
    direction: "column",
    styles: {
      width: "100%",
      float: "none",
      display: "block"
    },
    mode: Mode.Edit
  }
  return newList;
}

export function getRawTextInputComponent() {
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
  return textInputItem;
}

export function getRawGuidedCheckListComponent() {
  const newList: PageItem = {
    id: uuidv4(),
    type: PageType.GuidedCheckList,
    text: "",
    listItems: [""],
    rows: 5,
    checkedItems: [false],
    styles: {
      width: "100%",
      float: "none",
      display: "block"
    },
    mode: Mode.Edit
  }
  return newList;
}