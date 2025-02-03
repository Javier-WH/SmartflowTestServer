import { Button } from 'antd';
import ChatLogo from '../../assets/svg/chatLogo.svg'
import "./chat.css"
export default function Chat() {
  return (
    <Button className='chat-button' type="primary" shape='circle'><img src={ChatLogo} alt="Chat" /></Button>
  );
}