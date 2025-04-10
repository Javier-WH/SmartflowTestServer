/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { MainContext, type MainContextValues } from '../mainContext';
import { Input, type InputRef } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import options from './components/utils/options.ts';
import insertGuidedCheckList from './components/guidedCheckList/guidedCheckList.ts';
import useFilesManager from '../folderNavigator/hooks/useFileManager.ts';
import CustomImage from './components/utils/CustonImage.ts';
import CustomVideo from './components/utils/CustonVideo.ts';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';
import homeIcon from '../../assets/svg/homeIcon.svg';
import GuidedCheckListBlot from './components/blots/guidedCheckListBlot.ts';
import './components/guidedCheckList/react_guidedCheckList.tsx'
import { useDebouncedCallback } from 'use-debounce';






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
    const location = useLocation();
    let readOnly = location?.state?.readOnly;
    if (readOnly === undefined) readOnly = false;

    const { setInPage } = useContext(MainContext) as MainContextValues;
    const [contenido, setContenido] = useState('');
    const [title, setTitle] = useState('');
    const [showToolbar, setShowToolbar] = useState(true);
    const [ableToSave, setAbleToSave] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(0);
    const { updateFileContent, getFileContent } = useFilesManager();
    const quillRef = useRef<ReactQuill>(null);
    const inputRef = useRef<InputRef>(null);
    const navigate = useNavigate();
    const [selectedImage, setSelectedImage] = useState<HTMLImageElement | null>(null);

    // get selected image
    useEffect(() => {
        const setSelectedImageEvent = (e: Event) => {
            //setSelectedImage(null);
            const target = e.target as HTMLImageElement;

            const img = target.closest('img');
            if (img) {
                setSelectedImage(img);
                return;
            }
        }
        window.addEventListener('click', setSelectedImageEvent);
        return () => {
            window.removeEventListener('click', setSelectedImageEvent);
        }
    }, []);



    // Function to reposition the resizer
    const fixResizerPosition = () => {
        if (!selectedImage || !quillRef.current) {
            return;
        }
    
        const resizer = document.getElementById("editor-resizer") as HTMLElement;
        if (resizer) {
            const imageRect = selectedImage.getBoundingClientRect();
            const container = selectedImage.closest('.ql-editor');
            const quillRect = container?.getBoundingClientRect();
            if (!container || !quillRect) return
            // Calculate the top position of the image relative to the Quill container
            const topPosition = quillRect ? imageRect.top - quillRect.top : 0;
            resizer.style.top = `${topPosition}px`;
        }
    };

    // Reposition the resizer when the selected image changes
    useEffect(() => {
        fixResizerPosition();
    }, [selectedImage]);

    // Reposition the resizer on scroll
    useEffect(() => {
        if (!selectedImage) return;
   
        const quillEditorElement = selectedImage.closest('.ql-editor');
        if (quillEditorElement) {
   
            const handleScroll = () => {
                fixResizerPosition();
            };
            quillEditorElement.addEventListener('scroll', handleScroll);
            quillEditorElement.addEventListener('click', handleScroll);
            return () => {
                quillEditorElement.removeEventListener('scroll', handleScroll);
                quillEditorElement.removeEventListener('click', handleScroll);
            };
        }
    }, [selectedImage]);


    // Reposition the resizer when image size, display or float changes
    useEffect(() => {
        if (!selectedImage) return;
     
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'attributes') {
                    if (mutation.attributeName === 'style') {
                        const newDisplay = selectedImage.style.display;
                        const newFloat = selectedImage.style.float;
                        const previousDisplay = mutation.oldValue?.includes('display:') ? mutation.oldValue.split('display:')[1]?.split(';')[0]?.trim() : undefined;
                        const previousFloat = mutation.oldValue?.includes('float:') ? mutation.oldValue.split('float:')[1]?.split(';')[0]?.trim() : undefined;

                        if (newDisplay !== previousDisplay || newFloat !== previousFloat) {
                            fixResizerPosition();
                        }
                    } else if (mutation.attributeName === 'width' || mutation.attributeName === 'height') {
                        fixResizerPosition();
                    }
                }
            }
        });

        observer.observe(selectedImage, {
            attributes: true, // Listen for changes to attributes
            attributeFilter: ['style', 'width', 'height'], // Specifically target the style, width, and height attributes
            attributeOldValue: true, // Record the previous value of the attributes
        });

        const resizeObserver = new ResizeObserver(() => {
            fixResizerPosition();
        });
        resizeObserver.observe(selectedImage);

        return () => {
          
            observer.disconnect();
            resizeObserver.disconnect();
        };
    }, [selectedImage, quillRef]);



    // this useEfect check every image and video loaded in the editor and add the width, height and style attributes found in the page load
    // this is done to prevent a bug related to the width, height and styles of images
    useEffect(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            // add a matcher for images
            editor.clipboard.addMatcher('IMG', function (node, delta) {
                // get the width, height and style attributes 
                const widthAttr = node.getAttribute('width');
                const heightAttr = node.getAttribute('height');
                const styleAttr = node.getAttribute('style');
                //  update the delta
                delta.ops = delta.ops && delta.ops.map(op => {
                    if (op.insert && op.insert.image && typeof op.insert.image === 'string') {
                        return {
                            insert: {
                                image: {
                                    src: op.insert.image,
                                    width: widthAttr,
                                    height: heightAttr,
                                    style: styleAttr
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
            editor.clipboard.addMatcher('IFRAME', function (node, delta) {
                const styleAttr = node.getAttribute('style');
                const widthAttr = node.getAttribute('width');
                const heightAttr = node.getAttribute('height');
                delta.ops = delta.ops && delta.ops.map(op => {
                    if (
                        op.insert &&
                        op.insert.video &&
                        typeof op.insert.video === 'string'
                    ) {
                        return {
                            insert: {
                                video: {
                                    src: op.insert.video,
                                    width: widthAttr,
                                    height: heightAttr,
                                    style: styleAttr,
                                }
                            }
                        };
                    }
                    return op;
                });
                return delta;
            });
        }
    }, []);



    // if a content in database is found, when the page is loaded, the content is loaded
    useEffect(() => {

        if (id) {
            setAbleToSave(false);
            getFileContent(id)
                .then(response => {
                    if (response.error) return;
                    const { content, name, updated_at } = response.data;
                    setTitle(name === 'untitled' ? '' : name);
                    setContenido(content ? content : '');
                    /*const editor = quillRef.current?.getEditor();
                    if (editor) {
                        editor.root.innerHTML = content;
                    }*/

                    setUpdatedAt(updated_at);
                })
                .catch(error => console.error(error))
                .finally(() => setAbleToSave(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    const debouncedUpdate = useDebouncedCallback(
        async (id: string, htmlContent: string, title: string) => {
            // save htmlContent istead of content, prevent a bug related to images sizes and styles
            updateFileContent(id, htmlContent, title)
                .then((response) => {
                    console.log("[LS] -> src/modules/textEditor/textEditor.tsx:70 -> response: ", response)
                    if (response.error) {
                        console.error(response);
                        return;
                    }
                    setUpdatedAt(response.data.updated_at);
                });
        },
        500,
        { leading: false, trailing: true }
    );

    // this useEffect is to update the dataBase
    useEffect(() => {
        if (readOnly) return
        if (id && ableToSave && quillRef.current) {
            const editor = quillRef.current.getEditor();
            const htmlContent = editor.root.innerHTML;
            debouncedUpdate(id, htmlContent, title);
        }
    }, [contenido, title]);

    // handle nav bar style
    useEffect(() => {
        setInPage(true);

        return () => {
            setInPage(false);
        };
    }, []);


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
        setContenido(value);
    };

    const modulos = {
        toolbar: {
            container: '#toolbar',
            handlers: {
                'guided-checklist': insertGuidedCheckList
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any, @typescript-eslint/no-unused-vars
    const handleChangeSelection = () => {
        if (readOnly) return
        const activeElement = document.activeElement;
        const editorRoot = quillRef.current?.getEditor().root;
        const toolbarContainer = document.getElementById('toolbar-guided-checklist');

        const isToolbarElement = toolbarContainer?.contains(activeElement);

        if (editorRoot && activeElement && !isToolbarElement) {
            const isCollapseEditorFocused = editorRoot.contains(activeElement) &&
                (activeElement.classList.contains('collapse-editor') ||
                    activeElement.closest('.collapse-editor'));

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
                reader.onload = (loadEvent) => {
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



    return (
        <div onClick={handleChangeSelection} className="flex flex-col items-center h-full bg-white"  >
            <div className="flex flex-col h-full w-full max-w-3xl" >
                <div className="mt-8" >
                    <div className="flex items-center" >
                        <button type="button" style={styles.homeButton}
                            onClick={() => navigate(-1)}
                        >
                            <img src={homeIcon} alt="" /> {'>'}
                        </button>
                        {updatedAt ? (
                            <span className="w-full text-gray-400">
                                <span>Última actualización: </span>
                                {Intl.DateTimeFormat('es-ES', {
                                    dateStyle: 'medium',
                                    timeStyle: 'medium',
                                    hour12: true,
                                }).format(new Date(updatedAt))}
                            </span>
                        ) : null}
                    </div>
                    <Input
                        {...(readOnly && { readOnly: true })}
                        ref={inputRef}
                        style={styles.titleStyles}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Give your page a title"
                        onKeyDown={handleTitleKeyDown}
                    />
                </div>

                <ReactQuill
                    {...(readOnly && { readOnly: true })}
                    ref={quillRef}
                    theme="snow"
                    value={contenido}
                    onChange={handleEditorChange}
                    modules={modulos}
                    formats={options.formats}
                    placeholder=""
                    //className="h-full"
                    onChangeSelection={handleChangeSelection}
                    style={{ height: 'calc(100vh - 210px)', overflowY: 'hidden' }}

                />



            </div>
            <div className="flex justify-center w-full grow relative">
                <CustomToolbar show={showToolbar && !readOnly} name="toolbar" />
            </div>
            {/*<ImageResizer image={selectedImage} />*/}
        </div>
    );
}
