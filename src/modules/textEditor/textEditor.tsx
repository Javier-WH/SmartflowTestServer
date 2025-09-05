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
import { Button, Textarea, cn, Spinner } from '@heroui/react';
import useFileContent from '../folderNavigator/hooks/useFileContent.ts';
import { Image, message } from 'antd';
import { MainContext, type MainContextValues } from '../mainContext.tsx';
import CustomOrderedList from './components/blots/customOrderedList.ts';
import { GiSave } from "react-icons/gi"
import { GoVersions } from "react-icons/go";
import { findImageIndexBySrc } from '../textEditor/utils/findDeltaIndex';
import { useTranslation } from 'react-i18next';
import useDocumentControlVersion from './controlVersion/useDocumentControlVersion.ts';
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

export default function TextEditor() {
    const { id } = useParams();
    const { t } = useTranslation();
    const { setSelectedFileId, setChangleFileNameRequest, memberRoll, setParentFolders } = useContext(MainContext) as MainContextValues;
    const [isSavingVersion, setIsSavingVersion] = useState(false);
    const [title, setTitle] = useState('');
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
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
    const { addVersion } = useDocumentControlVersion({ documentId: id });

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

    const handleEditorChange = async (value: string) => {
        setContent(value);
        if (readOnly) return;
        if (!isLoading && !isMutating && quillRef.current) {
            const editor = quillRef.current.getEditor();
            const htmlContent = editor.root.innerHTML;
            handleContentOrTitleChange({ newContent: htmlContent });
        }
    };

    const handleContentOrTitleChange = async ({ newContent, newTitle }: { newContent?: string; newTitle?: string }) => {
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

    // add drag image logic
    const handleDrop = useCallback((event) => {
        event.preventDefault();

        const items = event.dataTransfer.items;
        for (let i = 0; i < items.length; i++) {
            if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
                const file = items[i].getAsFile();
                if (file) {
                    console.log('Imagen arrastrada:', file);
                    const reader = new FileReader();
                    reader.onload = (e) => {
                        const imageUrl = e.target.result;
                        insertImageIntoQuill(imageUrl);
                    };
                    reader.readAsDataURL(file);
                }
            }
        }
    }, []);

    // Función para manejar el 'dragover'
    const handleDragOver = useCallback((event) => {
        event.preventDefault();
    }, []);

    // Función para insertar la imagen en Quill
    const insertImageIntoQuill = useCallback((imageUrl) => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const range = editor.getSelection(true);
            editor.insertEmbed(range.index, 'image', imageUrl, 'user');
            editor.setSelection(range.index + 1, 0);
        }
    }, []);

    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            const container = editor.root;

            // Evento de pegado
            container.addEventListener('paste', handlePaste);

            // Eventos de arrastre
            window.addEventListener('dragover', handleDragOver);
            window.addEventListener('drop', handleDrop);

            return () => {
                container.removeEventListener('paste', handlePaste);
                window.removeEventListener('dragover', handleDragOver);
                window.removeEventListener('drop', handleDrop);
            };
        }
    }, [handlePaste, handleDragOver, handleDrop]);




    if (isLoading && !isInitialContentLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }


    // Función para insertar la lista personalizada con un índice específico
    const insertCustomNumberedList = (startIndex: number) => {
        const quill = quillRef.current?.getEditor();
        if (!quill) return;

        const range = quill.getSelection(true);
        if (!range) return;

        // Preparar nueva línea si es necesario
        const [line, offset] = quill.getLine(range.index);
        if (offset > 0 && line.length() > 1) {
            quill.insertText(range.index, '\n', "user");
            range.index++;
        }

        // Aplicar formato de lista con el startIndex
        quill.formatLine(range.index, 1, 'list', startIndex, 'user');

        // Mover cursor dentro del nuevo elemento de lista
        quill.setSelection(range.index + 1, 0);
    };




    const onKeyDown = (e: React.KeyboardEvent<HTMLDivElement>) => {
        // este evento borra la imagen seleccionada
        if (selectedImage !== null && (e.key === 'Delete' || e.key === 'Backspace')) {
            e.preventDefault();
            const imageElement = selectedImage as HTMLImageElement;
            const imageIndex = findImageIndexBySrc({ srcToFind: imageElement.src, editor: quillRef.current?.getEditor() });

            if (imageIndex !== -1) {
                const editor = quillRef.current?.getEditor();
                if (editor) {
                    editor.deleteText(imageIndex, 1, 'user');
                }
            }
            setSelectedImage(null);
        } else {
            setSelectedImage(null);
        }


        if (e.key === ' ') {
            const editor = quillRef.current?.getEditor();

            if (editor) {
                const selection = editor.getSelection(); // Obtener la selección actual
                if (selection) {
                    const cursorIndex = selection.index; // Posición del cursor

                    // Obtener el texto hasta la posición del cursor
                    const textBeforeCursor = editor.getText(0, cursorIndex);

                    // Expresión regular para encontrar un número seguido de un punto al final del texto
                    // Esto buscará patrones como "1." o "123."
                    const regex = /(\d+)\.$/;
                    const match = textBeforeCursor.match(regex);

                    if (match) {
                        e.preventDefault();
                        const numeroEncontrado = match[1]; // El grupo de captura (el número)
                        const fullMatch = match[0]; // Esto incluye el número y el punto (ej: "1.")

                        // Calcular la posición de inicio del texto a borrar
                        const startDeleteIndex = cursorIndex - fullMatch.length;

                        // Borrar el número y el punto
                        editor.deleteText(startDeleteIndex, fullMatch.length);

                        insertCustomNumberedList(Number(numeroEncontrado));
                    }
                }
            }
        }
    };

    // add a new document version to the database
    const handleOnPressSaveButton = async () => {
        setIsSavingVersion(true);
        await handleEditorChange(content);
        const saveVersion = await addVersion({ name: title, content });
        if (!saveVersion) {
            message.error(t('error_saving_version_message'))
            return
        }
        message.success(t('version_saved_successfully_message'))
        setIsSavingVersion(false);
    }

    return (
        <div className="relative flex flex-col h-full overflow-hidden px-[1px]">
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
                            setChangleFileNameRequest({ fileId: id, fileName: e.target.value });// esto hace una petición para cambiar el archivo en la barra de navegación, no en la base de datos
                        }}
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

        


                <div className="grid grid-rows-2 h-[60px]">
                    {fileContent?.updated_at ? (
                        <span className="w-full text-gray-400">
                            <span>{t('last_updated_label')}: </span>
                            {Intl.DateTimeFormat('es-ES', {
                                dateStyle: 'medium',
                                timeStyle: 'medium',
                                hour12: true,
                            }).format(new Date(fileContent?.updated_at))}
                        </span>
                    ) : null}
                    <div className="flex justify-between gap-[5px] mr-[10px]">

                        <div className="flex items-baseline gap-[20px] text-primary">
                            {
                                isMutating || isSavingVersion ? <span className="text-[18px]"><Spinner size="sm" />{t('saving_message')}</span> : null
                            }
                        </div>
                        <div className="w-[80px] flex justify-between">
                            {
                                readOnly ? null :
                                    <>
                                        <GoVersions
                                            title={t('document_version_history')}
                                            className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]"
                                        />
                                        <GiSave
                                            onClick={handleOnPressSaveButton}
                                            title={t('save_document')}
                                            className="text-4xl cursor-pointer text-gray-500 hover:text-primary transform transition-transform duration-200 hover:scale-[1.2]"
                                        />
                                    </>
                            }
                        </div>
                    </div>
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


            {readOnly && memberRoll && memberRoll.write ? (
                <div className="flex justify-end gap-2 items-center">
                    <Button
                        color="primary"
                        onPress={() => {
                            if (memberRoll?.write) {
                                setReadOnly(false);
                                quillRef.current?.setEditorContents(quillRef.current?.getEditor(), content);
                            } else {
                                message.error(t('you_do_not_have_permission_to_edit_file_message'));
                            }
                        }}
                    >
                        {t('edit_label')}
                    </Button>

                    <div id="toolbar" className="hidden" />
                </div>
            ) : null}

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
                        onChange={handleEditorChange}
                        onKeyDown={onKeyDown}
                        modules={modules}
                        formats={options.formats}
                        onChangeSelection={handleChangeSelection}
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
    );



}