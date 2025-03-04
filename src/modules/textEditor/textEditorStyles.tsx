const width = "740px"

const textContainerStyles: React.CSSProperties = {
  width: "100%",
  flexGrow: 1,
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
}

const titleStyles: React.CSSProperties = {
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
  height: '100%',
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
  marginBottom: "10px",
}


export default { textContainerStyles, editorStyles, titleStyles, homeButton, container }
