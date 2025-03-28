/* eslint-disable react-hooks/exhaustive-deps */
import './components/guidedCheckList/react_guidedCheckList.tsx';
import { MainContext, type MainContextValues } from '../mainContext';
import { Input, type InputRef } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx';
import { useNavigate, useParams } from 'react-router-dom';
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
//import { useDebouncedCallback } from 'use-debounce';


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

    const navigate = useNavigate();

    const { setInPage } = useContext(MainContext) as MainContextValues;
    const [contenido, setContenido] = useState('');
    const [title, setTitle] = useState('');
    const [showToolbar, setShowToolbar] = useState(true);
    const [ableToSave, setAbleToSave] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(0);
    const { updateFileContent, getFileContent } = useFilesManager();
    const quillRef = useRef<ReactQuill>(null);
    const inputRef = useRef<InputRef>(null);




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

    // this useEffect is to update the dataBase
    useEffect(() => {
        if (id && ableToSave && quillRef.current) {
            const editor = quillRef.current.getEditor();
            const htmlContent = editor.root.innerHTML;
            // save htmlContent istead of content, prevent a bug related to images sizes and styles
            updateFileContent(id, htmlContent, title)
                .then((response) => {
                    //console.log("[LS] -> src/modules/textEditor/textEditor.tsx:70 -> response: ", response)
                    if (response.error) {
                        console.error(response);
                        return;
                    }
                    setUpdatedAt(response.data.updated_at);
                });
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
            // Focuses on the Quill editor
            quillRef.current?.getEditor().root.focus();
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

    return (
        <div onClick={handleChangeSelection} className="flex flex-col items-center h-full bg-white">
            <div className="flex flex-col h-full w-full max-w-3xl">
                <div className="mt-8">
                    <div className="flex items-center">
                        <button type="button" style={styles.homeButton} onClick={() => setTimeout(() => navigate(-1), 0)} >
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
                        ref={inputRef}
                        style={styles.titleStyles}
                        value={title}
                        onChange={e => setTitle(e.target.value)}
                        placeholder="Give your page a title"
                        onKeyDown={handleTitleKeyDown}
                    />
                </div>

                <div className="flex flex-col grow bg-white">
                    <div className="flex justify-center w-full grow relative">
                        <CustomToolbar show={showToolbar} name="toolbar" />
                    </div>

                    <ReactQuill
                        ref={quillRef}
                        theme="snow"
                        value={contenido}
                        onChange={handleEditorChange}
                        modules={modulos}
                        formats={options.formats}
                        placeholder=""
                        className="h-full"
                        onChangeSelection={handleChangeSelection}
                    />

                </div>

            </div>
        </div>
    );
}
