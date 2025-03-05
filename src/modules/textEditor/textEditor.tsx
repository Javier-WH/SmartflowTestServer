import { MainContext, type MainContextValues } from '../mainContext';
import { Input, type InputRef } from 'antd';
import { useContext, useEffect, useState, useRef } from 'react';
import ReactQuill, { Quill } from 'react-quill';
import styles from './textEditorStyles.tsx';
import ResizeModule from '@botom/quill-resize-module';
import { useNavigate, useParams } from 'react-router-dom';
import CustomToolbar from './components/toolbar/CustonToolbar.tsx';
import options from './components/utils/options.ts';
import insertHelpBlock from './components/helpBlock/insertHelpBlock.ts';
import HelpBlockBlot from './components/blots/HelpBlockBlot.ts';
import useFilesManager from '../folderNavigator/hooks/useFileManager.ts';
import 'react-quill/dist/quill.snow.css';
import './textEditor.css';
import homeIcon from '../../assets/svg/homeIcon.svg';
//import { useDebouncedCallback } from 'use-debounce';

Quill.register('formats/help-block', HelpBlockBlot);

// Registro del módulo de resize
Quill.register('modules/resize', ResizeModule);

// Registrar los tamaños personalizados
const Size = Quill.import('attributors/style/size');
Size.whitelist = options.fontSizeList;
Quill.register(Size, true);

// Registro de fuentes personalizadas
const Font = Quill.import('formats/font');
Font.whitelist = options.fontList;
Quill.register(Font, true);

export default function TextEditor() {
    const { id } = useParams();
    const navigate = useNavigate();

    const { setInPage } = useContext(MainContext) as MainContextValues;
    const [contenido, setContenido] = useState('');
    const [title, setTitle] = useState('');
    const [ableToSave, setAbleToSave] = useState(false);
    const [updatedAt, setUpdatedAt] = useState(0);

    const { updateFileContent, getFileContent } = useFilesManager();

    const quillRef = useRef<ReactQuill>(null);
    const inputRef = useRef<InputRef>(null);

    // if a content in database is found, when the page is loaded, the content is loaded
    useEffect(() => {
        if (id) {
            setAbleToSave(false);
            getFileContent(id)
                .then(response => {
                    if (response.error) return;
                    console.log({ data: response.data });
                    const { content, name, updated_at } = response.data;
                    setTitle(name === 'untitled' ? '' : name);
                    setContenido(content ? content : '');
                    setUpdatedAt(updated_at);
                })
                .catch(error => console.error(error))
                .finally(() => setAbleToSave(true));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [id]);

    // this useEffect is to update the dataBase
    useEffect(() => {
        if (id && ableToSave) {
            updateFileContent(id, contenido, title).then((response) => {
                console.log("[LS] -> src/modules/textEditor/textEditor.tsx:70 -> response: ", response)
                if (response.error) {
                    console.error(response);
                    return;
                }
                setUpdatedAt(response.data.updated_at);
            });
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [contenido, title]);

    // handle nav bar style
    useEffect(() => {
        setInPage(true);

        return () => {
            setInPage(false);
        };
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
                helpBlock: insertHelpBlock,
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

    return (
        <div className="flex flex-col items-center h-full bg-white">
            <div className="flex flex-col h-full w-full max-w-3xl">
                <div className="mt-8">
                    <div className="flex items-center">
                        <button type="button" style={styles.homeButton} onClick={() => navigate('/home')}>
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
                        <CustomToolbar />
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
                    />
                </div>
            </div>
        </div>
    );
}
