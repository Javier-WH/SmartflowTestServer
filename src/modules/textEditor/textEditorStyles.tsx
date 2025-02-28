const width = "700px"

const textContainerStyles: React.CSSProperties = {
  width: "100vw",
  display: "flex",
  flexDirection: "column",
  justifyContent: "start",
  alignItems: "center",
  backgroundColor: "white",
  position: "absolute",
  top: 0,
  bottom: 0
}
const titleStyles: React.CSSProperties = {
  width,
  direction: "ltr"
}
const editorStyles: React.CSSProperties = {
  width,
}

export default { textContainerStyles, editorStyles, titleStyles }