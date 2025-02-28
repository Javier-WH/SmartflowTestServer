const width = "740px"

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
  paddingBottom: "80px",
}
const titleStyles: React.CSSProperties = {
  width,
  direction: "ltr",
  border: "none",
  backgroundColor: "white",
  borderRadius: "0px",
  fontSize: "40px",
  outline: "none",
  boxShadow: "none",
  fontWeight: 600,


}
const editorStyles: React.CSSProperties = {
  width,
}

const container: React.CSSProperties = {

}

const homeButton: React.CSSProperties = {
  width,
  marginTop: "10px",
  display: "flex",
  alignItems: "center",
  gap: "5px",
  color: "gray",
  fontWeight: 600,
  fontFamily: "monospace",


}


export default { textContainerStyles, editorStyles, titleStyles, homeButton, container }