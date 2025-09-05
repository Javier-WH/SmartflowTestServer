/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useEffect, useState, useRef, useContext, useCallback } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { useParams } from 'react-router-dom';
import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import options from './components/utils/options.ts';
import insertGuidedCheckList from './components/guidedCheckList/guidedCheckList.ts';
import CustomImage from './components/utils/CustonImage.ts';
import CustomVideo from './components/utils/CustonVideo.ts';
import GuidedCheckListBlot from './components/blots/guidedCheckListBlot.ts';
import { getParentFoldersForFile } from '../../utils/pageUtils.ts';
import { useDebouncedCallback } from 'use-debounce';
import { Textarea, cn, Spinner } from '@heroui/react';
import useFileContent from '../folderNavigator/hooks/useFileContent.ts';
import { Image, message } from 'antd';
import { MainContext, type MainContextValues } from '../mainContext.tsx';
import CustomOrderedList from './components/blots/customOrderedList.ts';
import { MdOutlineDocumentScanner } from "react-icons/md";
import { RiDeviceRecoverLine } from "react-icons/ri";
import { findImageIndexBySrc } from './utils/findDeltaIndex.ts';
import { useTranslation } from 'react-i18next';
import useDocumentControlVersion from './controlVersion/useDocumentControlVersion.ts';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';


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
    const { setSelectedFileId, setParentFolders } = useContext(MainContext) as MainContextValues;
    const [title, setTitle] = useState('');
    const quillRef = useRef<ReactQuill>(null);
    const quillContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);
    const [readOnly, setReadOnly] = useState(true);
    const currentFileId = useRef(id);
    const { data: fileContent, isLoading, mutate } = useFileContent({ fileId: id });
    const [content, setContent] = useState(fileContent?.content ?? '');
    const [isInitialContentLoaded, setIsInitialContentLoaded] = useState(false);
    const [visible, setVisible] = useState(false);


    const modules = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                'guided-checklist': insertGuidedCheckList,


            },
        },
        resize: {
            toolbar: {},
            locale: {
                floatLeft: 'Left',
                floatRight: 'Right',
                center: 'Center',
                restore: 'Restore',
            },
        },
        keyboard: {
            bindings: {
                "list autofill": {
                    shortKey: true
                }
            }
        },
    };


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

    const handleTitleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            const editor = quillRef.current?.getEditor();
            if (!editor) return;
            const contents = editor.getContents();

            // Check if the first element is a checklist
            const hasChecklistFirst = contents.ops?.[0]?.insert?.['guided-checklist'];

            // Insert a new line at the start if the first element is a checklist
            if (hasChecklistFirst) {
                editor.insertText(0, '\n', 'user');
            }

            // Set the cursor at the start
            editor.focus();
            editor.setSelection(0, 0);
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

    // set selected file when file is selected
    useEffect(() => {
        if (!id || !fileContent) return;
        setSelectedFileId(id);

        // get the file route
        const { name } = fileContent;
        const parentFolders = getParentFoldersForFile(id);
        const fileRoute = ('/' + parentFolders.join('/') + '/' + name).replace(/\/+/g, '/');
        setParentFolders(fileRoute);
    }, [id, fileContent]);



    useEffect(() => {
        if (quillRef.current) quillRef.current.focus();
    }, [quillRef.current]);

    useEffect(() => {
        if (fileContent && !isInitialContentLoaded) {
            setContent(fileContent.content ?? '');
            setTitle(fileContent?.name === "untitled" ? '' : fileContent?.name ?? '');
            currentFileId.current = id;
            setIsInitialContentLoaded(true);
        }
    }, [fileContent, id, isInitialContentLoaded]);

    useEffect(() => {
        // This cleanup function runs when the component unmounts OR
        // when 'id' changes *before* the next render's effect runs.
        return () => {
            console.log(`ID changed to ${id} or component unmounting. Cancelling pending updates.`);
            debouncedUpdate.cancel();
            // Update the ref *immediately* when ID changes, so subsequent checks are accurate
            currentFileId.current = id;
            setIsInitialContentLoaded(false);
            setReadOnly(true);
        };
    }, [id, debouncedUpdate]);

    // get selected image
    useEffect(() => {
        const handleElementClick = (e: MouseEvent) => {
            const target = e.target as HTMLElement;
            if (
                target.id === 'editor-resizer' ||
                target.classList.contains('ant-image-preview-wrap') ||
                target.classList.contains('ant-image-preview-operations-operation') ||
                target.classList.contains('ant-image-preview-operations') ||
                target.classList.contains('ant-image-preview-img') ||
                target.tagName === 'svg' ||
                target.tagName === 'path'
            )
                return;
            const element = target.closest('img');
            if (element && !element.classList.contains('ant-image-preview-img')) {
                setSelectedImage(element as HTMLElement);

                return;
            }
            setSelectedImage(null);
        };
        window.addEventListener('click', handleElementClick);
        return () => {
            window.removeEventListener('click', handleElementClick);
        };
    }, []);

    // event to open image preview
    useEffect(() => {
        const resizer = document.getElementById('editor-resizer');
        if (!selectedImage) {
            resizer?.classList.remove('showResizer');
            return;
        }
        resizer?.classList.add('showResizer');
        const openImagePreview = (e: Event) => {
            const target = e.target as HTMLImageElement;

            if (target.id === 'editor-resizer') {
                setVisible(true);
            }
        };
        document.addEventListener('click', openImagePreview);
        return () => {
            document.removeEventListener('click', openImagePreview);
        };
    }, [selectedImage]);

    // adjust resizer to prevent edition while readonly
    useEffect(() => {
        const imageToolbar = document.getElementsByClassName('toolbar')[0];
        const imagehandler = document.getElementsByClassName('handler')[0];
        // if readOnly cant change image size, so we have to hide the toolbar
        if (readOnly) {
            if (imageToolbar) {
                imageToolbar.classList.add('hidden');
            }
            if (imagehandler) {
                imagehandler.classList.add('hidden');
            }
        }
    }, [selectedImage]);


    if (isLoading && !isInitialContentLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }


    return (
        <div style={{display: "grid", gridTemplateColumns: "1fr 200px", height: "100%"}}>
            <div className="relative flex flex-col h-full overflow-hidden px-[1px]">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="grow">
                        <Textarea
                            {...(readOnly && { readOnly: true })}
                            ref={inputRef}
                            value={title}
                            placeholder={t('give_your_page_a_title_message')}
                            onKeyDown={handleTitleKeyDown}
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

                        <Image
                            // Ant Design Image component for image preview
                            width={200}
                            style={{ display: 'none' }}
                            src=""
                            preview={{
                                visible: visible,
                                src: (selectedImage as HTMLImageElement)?.src || '',
                                onVisibleChange: value => {
                                    setVisible(value);
                                },
                            }}
                        />

                    </div>
                </div>
            </div>

            <div style={{ width: '100%', height: '100%' }}>
                <div style={{ width: '100%', height: '40px', display: 'flex', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: '20px' }}>
                    <MdOutlineDocumentScanner
                        title={t("back_to_document_button")}
                        className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]" 
                        onClick = {()=>navigate(`/${organization_id}/edit/${id}`, { state: { readOnly: true } })}
                    />
                    <RiDeviceRecoverLine 
                        title={t("recover_button")}
                        className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]" 
                    />
                </div>


            </div>
        </div>
    );



}