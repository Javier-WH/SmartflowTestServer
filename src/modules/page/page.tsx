import { MainContext, MainContextValues } from "../mainContext"
import { useContext, useEffect } from "react"
import homeIcon from "../../assets/svg/homeIcon.svg"
import { useNavigate } from "react-router-dom"
import "./page.css"
export default function Page() {
  const { setInPage } = useContext(MainContext) as MainContextValues
  const navigate = useNavigate();

  useEffect(() => {
    setInPage(true)
    return () => {
      setInPage(false)
    }
  }, [setInPage])
  
  return <>
    <div className="page-main-container">
      <div className="page-main-butons-container">
        <button onClick={() => navigate(-1) }> <img src={homeIcon}/> {">"}</button>
      </div>
        <div className="page-content-container">

        </div>
    </div>
  </>

}