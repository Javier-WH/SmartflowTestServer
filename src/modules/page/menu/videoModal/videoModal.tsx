import { useState, useContext } from 'react';
import { Button, Modal, Input, Popover } from 'antd';
import addVideoIcon from '../assets/svg/addVideoIcon.svg';
import { PageContext, type PageContextValues } from '../../page';
import { v4 as uuidv4 } from 'uuid';
import { Mode, PageType } from '../../types/pageEnums';
import type { PageItem } from '../../types/pageTypes';

const VideoModal: React.FC = () => {
    const { pageContent, setPageContent } = useContext(PageContext) as PageContextValues;

    const [isModalOpen, setIsModalOpen] = useState(false);
    const [videoUrl, setVideoUrl] = useState<string>('');

    const showModal = () => {
        setIsModalOpen(true);
    };

    const handleOk = () => {
        if (videoUrl.length === 0) return;
        const pageContentCopy = [...pageContent];
        const newVideoItem: PageItem = {
            id: uuidv4(),
            type: PageType.Video,
            src: videoUrl,
            styles: {
                width: '90%',
                height: 'auto',
                float: 'none',
                display: 'block',
                margin: '0 auto',
            },
            mode: Mode.Edit,
        };
        pageContentCopy.push(newVideoItem);

        const newTextItem: PageItem = {
            id: uuidv4(),
            type: PageType.Text,
            text: '',
            styles: {
                width: '100%',
                float: 'none',
                display: 'block',
            },
            mode: Mode.Edit,
        };
        pageContentCopy.push(newTextItem);
        setPageContent(pageContentCopy);
        setVideoUrl('');
        setIsModalOpen(false);
    };

    const handleCancel = () => {
        setIsModalOpen(false);
    };

    return (
        <>
            <Button type="primary" icon={<img src={addVideoIcon} onClick={showModal} />} />
            <Modal title="Add Video" open={isModalOpen} onOk={handleOk} onCancel={handleCancel} okText="Add">
                <label htmlFor="">Enter video URL</label>
                <Input
                    style={{ direction: 'ltr' }}
                    value={videoUrl}
                    onChange={e => setVideoUrl(e.target.value)}
                    placeholder="Enter video URL"
                />
            </Modal>
        </>
    );
};

export default VideoModal;
