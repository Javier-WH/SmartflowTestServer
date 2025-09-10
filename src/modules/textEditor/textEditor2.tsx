/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { useEffect, useState, useRef, useContext } from 'react';
import { useParams } from 'react-router-dom';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import { getParentFoldersForFile } from '../../utils/pageUtils.ts';
import { useDebouncedCallback } from 'use-debounce';
import { Button, Textarea, cn, Spinner } from '@heroui/react';
import useFileContent from '../folderNavigator/hooks/useFileContent.ts';
import { Image, message } from 'antd';
import { MainContext, type MainContextValues } from '../mainContext.tsx';
import { GiSave } from "react-icons/gi"
import { GoVersions } from "react-icons/go";
import { useTranslation } from 'react-i18next';
import useDocumentControlVersion from './controlVersion/useDocumentControlVersion.ts';
import { useNavigate } from 'react-router-dom';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';
import Editor from './editor.tsx';


export default function TextEditor2() {
    const { id, organization_id } = useParams();
    const navigate = useNavigate();
    const { t } = useTranslation();
    const { setSelectedFileId, setChangleFileNameRequest, memberRoll, setParentFolders } = useContext(MainContext) as MainContextValues;
    const [isSavingVersion, setIsSavingVersion] = useState(false);
    const [title, setTitle] = useState('');
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



    const handleEditorChange = async (value: string) => {
        setContent(value);
        if (readOnly) return;
        if (!isLoading && !isMutating) {
          handleContentOrTitleChange({ newContent: value });
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



      // set initial content
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

    if (isLoading && !isInitialContentLoaded) {
        return (
            <div className="flex justify-center items-center h-full">
                <Spinner size="lg" />
            </div>
        );
    }

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
                                            onClick={async ()=>{
                                                //await handleOnPressSaveButton();
                                                navigate(`/${organization_id}/history/${id}`, { state: { readOnly: !memberRoll.write } })
                                            }}
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
                    <Editor
                        readOnly={readOnly}
                        value={content}
                        onChange = {handleEditorChange}
                        placeholder = {t('write_something_here_placeholder')}
                        toolbarId = "#toolbar"
                        debouncedUpdate = {debouncedUpdate}
                    />

                    <Image
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