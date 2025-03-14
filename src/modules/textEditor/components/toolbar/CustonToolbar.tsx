import GuidedCheckListIcon from "../../assets/svg/addGuidedCheckList.svg";


export default function CustomToolbar() {


  return ((
    <div id="toolbar">
      <select className="ql-font" style={{ width: "180px" }}>
        <option value="arial" selected>Arial</option>
        <option value="times-new-roman">Times New Roman</option>
        <option value="courier-new">Courier New</option>
        <option value="comic-sans-ms">Comic Sans MS</option>
        <option value="roboto">Roboto</option>
        <option value="georgia">Georgia</option>
        <option value="verdana">Verdana</option>
        <option value="open-sans">Open Sans</option>
        <option value="lato">Lato</option>
        <option value="montserrat">Montserrat</option>
        <option value="impact">Impact</option>
        <option value="fantasy">Fantasy</option>
        <option value="cursive">Cursive</option>
        <option value="monospace">Monospace</option>
        <option value="serif">Serif</option>
      </select>
      <select className="ql-size" style={{ width: "50px" }}>
        <option value="10px">10</option>
        <option value="12px">12</option>
        <option value="14px">14</option>
        <option value="16px" selected>16</option>
        <option value="18px">18</option>
        <option value="20px">20</option>
        <option value="22px">22</option>
        <option value="24px">24</option>
        <option value="26px">26</option>
        <option value="28px">28</option>
        <option value="30px">30</option>
        <option value="32px">32</option>
        <option value="34px">34</option>
        <option value="36px">36</option>
        <option value="38px">38</option>
        <option value="40px">40</option>
        <option value="42px">42</option>
        <option value="44px">44</option>
        <option value="46px">46</option>
        <option value="48px">48</option>
      </select>
      <button className="ql-bold"></button>
      <button className="ql-italic"></button>
      <button className="ql-underline"></button>
      <button className="ql-strike"></button>
      <button className="ql-list" value="ordered"></button>
      <button className="ql-list" value="bullet"></button>
      <select className="ql-align"></select>
      <select className="ql-color"></select>
      <select className="ql-background"></select>
      <button className="ql-link"></button>
      <button className="ql-image"></button>
      <button className="ql-video"></button>

      {/*<button className="ql-guided-checklist-block">
        <img src={GuidedCheckListIcon} alt="" />
      </button>*/}
    </div>
  ));
}
