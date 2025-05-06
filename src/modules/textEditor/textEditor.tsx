/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useEffect, useState, useRef, useContext } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import { useParams } from 'react-router-dom';
import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import options from './components/utils/options.ts';
import insertGuidedCheckList from './components/guidedCheckList/guidedCheckList.ts';
import CustomImage from './components/utils/CustonImage.ts';
import CustomVideo from './components/utils/CustonVideo.ts';
import GuidedCheckListBlot from './components/blots/guidedCheckListBlot.ts';
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useDebouncedCallback } from 'use-debounce';
import { Button, Textarea, cn } from '@heroui/react';
import { Spinner } from '@heroui/react';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';
import useFileContent from '../folderNavigator/hooks/useFileContent.ts';
import { Image, message } from 'antd';
import { MainContext, type MainContextValues } from '../mainContext.tsx';

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

export default function TextEditor() {
    const { id } = useParams();

    const { setSelectedFileId, setChangleFileNameRequest, memberRoll } = useContext(MainContext) as MainContextValues;

    const [title, setTitle] = useState('');
    const [showToolbar, setShowToolbar] = useState(true);
    const quillRef = useRef<ReactQuill>(null);
    const quillContainerRef = useRef<HTMLDivElement>(null);
    const inputRef = useRef(null);
    const [selectedImage, setSelectedImage] = useState<HTMLElement | null>(null);

    const [readOnly, setReadOnly] = useState(true);

    const currentFileId = useRef(id);

    const { data: fileContent, isLoading, mutate, isMutating } = useFileContent({ fileId: id });

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
        500,
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

    const handleEditorChange = (value: string) => {
        setContent(value);
        if (readOnly) return;
        if (!isLoading && !isMutating && quillRef.current) {
            const editor = quillRef.current.getEditor();
            const htmlContent = editor.root.innerHTML;

            handleContentOrTitleChange({ newContent: htmlContent });
            // setTimeout(() => {
            //     quillContainerRef.current?.scroll({
            //         top: quillContainerRef.current?.scrollTop,
            //         behavior: 'instant',
            //     });
            // });
        }
    };

    const handleContentOrTitleChange = ({ newContent, newTitle }: { newContent?: string; newTitle?: string }) => {
        let needsDebounce = false;

        if (newContent !== undefined && newContent !== content) {
            setContent(newContent);
            needsDebounce = true;
        }
        if (newTitle !== undefined && newTitle !== title) {
            setTitle(newTitle);
            needsDebounce = true;
        }

        // Only schedule update if not read-only, content is loaded, and not currently saving
        // Crucially, also check if the initial content for the *current* ID has been loaded
        if (!readOnly && isInitialContentLoaded && !isMutating && needsDebounce) {
            // Schedule the update with the ID relevant *at this moment*
            console.log(`Scheduling update for ID: ${currentFileId.current}`);
            debouncedUpdate({
                id: currentFileId.current,
                ...(newContent !== undefined && { htmlContent: newContent }),
                ...(newTitle !== undefined && { title: newTitle }),
            });
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const handleChangeSelection = () => {
        if (readOnly) return;
        const activeElement = document.activeElement;
        const editorRoot = quillRef.current?.getEditor().root;
        const toolbarContainer = document.getElementById('toolbar-guided-checklist');

        const isToolbarElement = toolbarContainer?.contains(activeElement);

        if (editorRoot && activeElement && !isToolbarElement) {
            const isCollapseEditorFocused =
                editorRoot.contains(activeElement) &&
                (activeElement.classList.contains('collapse-editor') || activeElement.closest('.collapse-editor'));

            if (isCollapseEditorFocused) {
                setShowToolbar(false);
            } else {
                setShowToolbar(true);
            }
        }
    };

    //paste image handler
    const handlePaste = (e: ClipboardEvent) => {
        const editor = quillRef.current?.getEditor();
        if (!editor) return;

        const items = e.clipboardData?.items;
        if (!items) return;

        // search for image in clipboard
        for (const item of items) {
            if (item.type.startsWith('image')) {
                e.preventDefault();
                const file = item.getAsFile();
                if (!file) return;

                const reader = new FileReader();
                reader.onload = loadEvent => {
                    const imageUrl = loadEvent.target?.result;
                    if (typeof imageUrl === 'string') {
                        const range = editor.getSelection(true);
                        editor.insertEmbed(range?.index || 0, 'image', imageUrl);
                    }
                };
                reader.readAsDataURL(file);
                return;
            }
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
        if (!id) return;
        setSelectedFileId(id);
    }, [id]);

    useEffect(() => {
        if (quillRef.current) quillRef.current.focus();
    }, [quillRef.current]);

    useEffect(() => {
        if (fileContent && !isInitialContentLoaded) {
            setContent(fileContent.content ?? '');
            setTitle(fileContent.name ?? '');
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

    // add paste event listener
    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const container = editor.root;
            container.addEventListener('paste', handlePaste);
            return () => {
                container.removeEventListener('paste', handlePaste);
            };
        }
    }, []);

    if (isLoading && !isInitialContentLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

    return (
        <div className="flex flex-col h-full overflow-hidden px-[1px]">
            <div className="flex justify-between items-center flex-wrap gap-4">
                <div className="grow">
                    <Textarea
                        {...(readOnly && { readOnly: true })}
                        ref={inputRef}
                        value={title}
                        onChange={e => {
                            setTitle(e.target.value);
                            if (readOnly) return;
                            handleContentOrTitleChange({ newTitle: e.target.value });
                            setChangleFileNameRequest({ fileId: id, fileName: e.target.value });
                        }}
                        placeholder="Give your page a title"
                        onKeyDown={handleTitleKeyDown}
                        minRows={1}
                        maxRows={4}
                        radius="none"
                        classNames={{
                            inputWrapper: '!bg-transparent shadow-none p-0',
                            input: 'bg-transparent shadow-none focus:bg-transparent text-4xl font-bold',
                        }}
                    />
                </div>

                <div>
                    {/* <button type="button" style={styles.homeButton} onClick={() => navigate(-1)}> */}
                    {/*     <img src={homeIcon} alt="" /> {'>'} */}
                    {/* </button> */}
                    {fileContent?.updated_at ? (
                        <span className="w-full text-gray-400">
                            <span>Última actualización: </span>
                            {Intl.DateTimeFormat('es-ES', {
                                dateStyle: 'medium',
                                timeStyle: 'medium',
                                hour12: true,
                            }).format(new Date(fileContent?.updated_at))}
                        </span>
                    ) : null}
                </div>
            </div>

            <header
                className={cn({
                    hidden: readOnly,
                    'w-full p-2 rounded-2xl shadow-gray-200 shadow-md ring-gray-200 ring-1 mt-2 px-2 bg-gray-100':
                        !readOnly,
                })}
            >
                <CustomToolbar show={!readOnly} name="toolbar" />
            </header>

            {readOnly && memberRoll.write && (
                <div className="flex justify-end gap-2 items-center">
                    <Button
                        color="primary"
                        onPress={() => {
                            if (memberRoll.write) {
                                setReadOnly(false);
                            } else {
                                message.error('You do not have permission to edit this page');
                            }
                        }}
                    >
                        Editar
                    </Button>

                    <div id="toolbar" className="hidden" />
                </div>
            )}

            <div
                ref={quillContainerRef}
                className="flex justify-center h-full overflow-y-auto mt-4 scrollbar-thumb-rounded-full scrollbar scrollbar-thumb-primary scrollbar-track-transparent scrollbar-thin"
            >
                <div className="h-full w-full max-w-[60%]">
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
                        onChange={handleEditorChange}
                        modules={modules}
                        formats={options.formats}
                        onChangeSelection={handleChangeSelection}
                        className="w-full h-full pr-12 lg:pr-0"
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
    );

    return (
        <div className="flex flex-row lg:flex-col h-full w-full relative lg:overflow-hidden">
            <section className="w-full lg:h-full lg:overflow-hidden">
                <div className="flex justify-between items-center flex-wrap gap-4">
                    <div className="grow">
                        <Textarea
                            {...(readOnly && { readOnly: true })}
                            ref={inputRef}
                            value={title}
                            onChange={e => {
                                setTitle(e.target.value);
                                if (readOnly) return;
                                handleContentOrTitleChange({ newTitle: e.target.value });
                                setChangleFileNameRequest({ fileId: id, fileName: e.target.value });
                            }}
                            placeholder="Give your page a title"
                            onKeyDown={handleTitleKeyDown}
                            minRows={1}
                            maxRows={4}
                            radius="none"
                            classNames={{
                                inputWrapper: '!bg-transparent shadow-none p-0',
                                input: 'bg-transparent shadow-none focus:bg-transparent text-4xl font-bold',
                            }}
                        />
                    </div>

                    <div>
                        {/* <button type="button" style={styles.homeButton} onClick={() => navigate(-1)}> */}
                        {/*     <img src={homeIcon} alt="" /> {'>'} */}
                        {/* </button> */}
                        {fileContent?.updated_at ? (
                            <span className="w-full text-gray-400">
                                <span>Última actualización: </span>
                                {Intl.DateTimeFormat('es-ES', {
                                    dateStyle: 'medium',
                                    timeStyle: 'medium',
                                    hour12: true,
                                }).format(new Date(fileContent?.updated_at))}
                            </span>
                        ) : null}
                    </div>
                </div>

                <header
                    className={cn(
                        'w-full p-2 bg-gray-100 rounded-2xl shadow-gray-200 shadow-md ring-gray-200 ring-1 mt-4',
                        {
                            hidden: readOnly,
                        },
                    )}
                >
                    <CustomToolbar show={!readOnly} name="toolbar" />
                </header>

                <div
                    ref={quillContainerRef}
                    className="flex flex-col items-center w-full h-full pb-4 mt-4 overflow-hidden lg:overflow-y-auto cursor-text"
                >
                    <ReactQuill
                        {...(readOnly && { readOnly: true })}
                        ref={ref => {
                            if (ref) {
                                quillRef.current = ref;

                                configureQuillMatchers();
                            }
                        }}
                        theme="snow"
                        value={content}
                        onChange={handleEditorChange}
                        modules={modules}
                        formats={options.formats}
                        onChangeSelection={handleChangeSelection}
                        className="w-full lg:w-[60%] h-full pr-12 lg:pr-0"
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
            </section>
        </div>
    );
}
