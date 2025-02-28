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
  bottom: 0,
  overflowY: "auto",
}
const titleStyles: React.CSSProperties = {
  width,
  direction: "ltr",
  position: "fixed",
  zIndex: 1000,
  border: "5px solid white",
  backgroundColor: "white",
  borderRadius: "0px",
  fontSize: "2em",
  outline: "none",
  boxShadow: "none",
  fontWeight: 600,

}
const editorStyles: React.CSSProperties = {
  width,
}

export default { textContainerStyles, editorStyles, titleStyles }