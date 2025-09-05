/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { useParams } from 'react-router-dom';
import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import options from './components/utils/options.ts';
import insertGuidedCheckList from './components/guidedCheckList/guidedCheckList.ts';
import CustomImage from './components/utils/CustonImage.ts';
import CustomVideo from './components/utils/CustonVideo.ts';
import GuidedCheckListBlot from './components/blots/guidedCheckListBlot.ts';
import { Textarea, cn, Spinner } from '@heroui/react';
import useFileContent from '../folderNavigator/hooks/useFileContent.ts';
import { message } from 'antd';
import CustomOrderedList from './components/blots/customOrderedList.ts';
import { MdOutlineDocumentScanner } from "react-icons/md";
import { RiDeviceRecoverLine } from "react-icons/ri";
import { useTranslation } from 'react-i18next';
import useDocumentControlVersion from './controlVersion/useDocumentControlVersion.ts';
import { useNavigate } from 'react-router-dom';
import { useDebouncedCallback } from 'use-debounce';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';

export interface DocumentVersionData {
    name: string;
    content: string;
    created_at: string;
    id: string;
    document_id: string
}


Quill.register(CustomOrderedList, true);

// this is our custom blot
Quill.register('formats/guided-checklist', GuidedCheckListBlot); // Mismo nombre que el blot

// Override the image and video (iframe) blot in order to prevent a bug related to the width and height of images and videos
Quill.register(CustomImage, true);
Quill.register(CustomVideo, true);

// register image resize module
Quill.register('modules/resize', ResizeModule);

// Register custom font sizes
const Size = Quill.import('attributors/style/size');
Size.whitelist = options.fontSizeList;
Quill.register(Size, true);

// Register custom fonts
const Font = Quill.import('formats/font');
Font.whitelist = options.fontList;
Quill.register(Font, true);

export default function VersionViewer() {
    const { id, organization_id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const [title, setTitle] = useState('');
    const quillRef = useRef<ReactQuill>(null);
    const quillContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef(null);
    const [readOnly] = useState(true);
    const currentFileId = useRef(id);
    const { data: fileContent, isLoading, mutate, isMutating } = useFileContent({ fileId: id });
    const [content, setContent] = useState(fileContent?.content ?? '');
    const [isInitialContentLoaded, setIsInitialContentLoaded] = useState(false);
    const [documentVersions, setDocumentVersions] = useState<DocumentVersionData[]>([]);
    const { getVersions } = useDocumentControlVersion({ documentId: id });
    const [isLoadingVersions, setIsLoadingVersions] = useState(false)
   
    const debouncedUpdate = useDebouncedCallback(
        async ({ id, htmlContent, title }: { id: string; htmlContent?: string; title?: string }) => {
            if (!id) return;

            await mutate({
                id,
                ...(htmlContent ? { content: htmlContent } : {}),
                ...(title ? { name: title } : {}),
            });
        },
        400,
        { leading: false, trailing: true },
    );


    const modules = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                'guided-checklist': insertGuidedCheckList,
            },
        }
    };


    const configureQuillMatchers = () => {
        const editor = quillRef.current.getEditor();
        // add a matcher for images
        editor.clipboard.addMatcher('IMG', (node, delta) => {
            // get the width, height and style attributes
            const widthAttr = node.getAttribute('width');
            const heightAttr = node.getAttribute('height');
            const styleAttr = node.getAttribute('style');
            //  update the delta
            delta.ops = delta.ops?.map(op => {
                if (op.insert?.image && typeof op.insert.image === 'string') {
                    return {
                        insert: {
                            image: {
                                src: op.insert.image,
                                width: widthAttr,
                                height: heightAttr,
                                style: styleAttr,
                            },
                        },
                    };
                }
                return op;
            });
            return delta;
        });

        // add a matcher for videos
        // this do the same as the image matcher but for videos (iframes)
        editor.clipboard.addMatcher('IFRAME', (node, delta) => {
            const styleAttr = node.getAttribute('style');
            const widthAttr = node.getAttribute('width');
            const heightAttr = node.getAttribute('height');
            delta.ops = delta.ops?.map(op => {
                if (op.insert?.video && typeof op.insert.video === 'string') {
                    return {
                        insert: {
                            video: {
                                src: op.insert.video,
                                width: widthAttr,
                                height: heightAttr,
                                style: styleAttr,
                            },
                        },
                    };
                }
                return op;
            });
            return delta;
        });
    };


    useEffect(() => {
        if (fileContent && !isInitialContentLoaded && !isMutating) {
            setContent(fileContent.content ?? '');
            setTitle(fileContent?.name === "untitled" ? '' : fileContent?.name ?? '');
            currentFileId.current = id;
            setIsInitialContentLoaded(true);
        }
    }, [fileContent, id, isInitialContentLoaded]);




    //obtiene las versiones
    useEffect(() => {
        setIsLoadingVersions(true);
        getVersions()
            .then((versions) => {
                setDocumentVersions(versions);
            })
            .catch((error) => {
                message.error('Error al obtener las versiones');
                console.error('Error al obtener las versiones:', error);
            })
            .finally(() => {
                setIsLoadingVersions(false);
            });
    }, [])


 

    if (isLoading && !isInitialContentLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }


    return (
        <div style={{ display: "grid", gridTemplateColumns: "1fr 250px", height: "100%" }}>
            <div className="relative flex flex-col h-full overflow-hidden px-[1px]">

                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="grow">
                        <Textarea
                            {...(readOnly && { readOnly: true })}
                            ref={inputRef}
                            value={title}
                            placeholder={t('give_your_page_a_title_message')}
                            minRows={1}
                            maxRows={2}
                            radius="none"
                            classNames={{
                                inputWrapper: '!bg-transparent shadow-none p-0 ',
                                input: 'bg-transparent shadow-none focus:bg-transparent text-4xl font-bold',
                            }}
                        />
                    </div>

                </div>

                <header
                    className={cn({
                        hidden: readOnly,
                        'w-full p-2 rounded-2xl shadow-gray-200 shadow-md ring-gray-200 ring-1 mt-2 px-2 bg-gray-100 min-h-15':
                            !readOnly,
                    })}
                >

                    <CustomToolbar show={!readOnly} name="toolbar" />

                </header>

                <div
                    ref={quillContainerRef}
                    className="flex justify-center h-full overflow-y-auto mt-4 scrollbar-thumb-rounded-full scrollbar-thumb-primary scrollbar-track-transparent scrollbar-thin"
                >
                    <div className="h-full w-full max-w-[70%]">
                        <ReactQuill
                            readOnly={readOnly}
                            ref={ref => {
                                if (ref) {
                                    quillRef.current = ref;
                                    configureQuillMatchers();
                                }
                            }}
                            theme="snow"
                            value={content}
                            modules={modules}
                            formats={options.formats}
                            className="w-full h-full pr-12 lg:pr-0"
                            placeholder={t('write_something_here_placeholder')}
                        />

                    </div>
                </div>

            </div>

            <div style={{ width: '100%', height: '100%' }}>

                <div style={{ width: '100%', height: '40px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <MdOutlineDocumentScanner
                        title={t("back_to_document_button")}
                        className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]"
                        onClick={() => navigate(`/${organization_id}/edit/${id}`, { state: { readOnly: true } })}
                    />
                    <RiDeviceRecoverLine
                        title={t("recover_button")}
                        className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]"
                        onClick={async () => {
                            await debouncedUpdate({ id: currentFileId.current, htmlContent: content, title: title })
                           
                        }}
                    />
                </div>
                <h3 className='text-[14px] text-gray-500 font-bold mb-[15px] mt-[15px]'>{t("versions")}</h3>
                <div className="flex flex-col gap-2 overflow-y-auto h-[calc(100vh-200px)]">
                    {
                        isLoadingVersions 
                        ?<div className="flex justify-center items-center h-full">
                                <Spinner size="lg" />
                            </div>
                            :documentVersions?.map((version) => (
                                <div
                                    onClick={() => setContent(version.content)}
                                    key={version.id}
                                    className="
                                    flex items-center justify-between
                                    text-gray-700 text-sm
                                    p-2 rounded-lg
                                    transition-all duration-200
                                    cursor-pointer
                                    hover:bg-gray-100 hover:text-primary
                                "
                                >
                                    <span className="font-medium">
                                        {new Date(version.created_at).toLocaleString(navigator.language, {
                                            year: 'numeric',
                                            month: 'long',
                                            day: 'numeric',
                                            hour: 'numeric',
                                            minute: 'numeric',
                                        })}
                                    </span>
                                </div>
                            ))
                    }
                </div>

            </div>

        </div>

    );



}