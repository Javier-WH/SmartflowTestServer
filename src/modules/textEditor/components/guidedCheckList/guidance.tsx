/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useCallback, useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import ResizeModule from '@botom/quill-resize-module';
//import CustomToolbar from '../toolbar/CustonToolbar';
import CustomImage from '../utils/CustonImageGuidance';
import CustomVideo from '../utils/CustonVideoGuidance';
import { useDebouncedCallback } from 'use-debounce';
import CustomOrderedListContainerGuidance from '../blots/custonOrderedListGuidance';
import { t } from 'i18next';
import { setActiveEditor } from '../customToolbar/editorStore';
//import { t } from 'i18next';

const fontSizeList = [
    '10px',
    '12px',
    '14px',
    '16px',
    '18px',
    '20px',
    '22px',
    '24px',
    '26px',
    '28px',
    '30px',
    '32px',
    '34px',
    '36px',
    '38px',
    '40px',
    '42px',
    '44px',
    '46px',
    '48px',
];
const fontList = [
    'arial',
    'times-new-roman',
    'courier-new',
    'comic-sans-ms',
    'roboto',
    'georgia',
    'verdana',
    'open-sans',
    'lato',
    'montserrat',
    'impact',
    'fantasy',
    'cursive',
    'monospace',
    'serif',
];

const Size = Quill.import('attributors/style/size') as any;
Size.whitelist = fontSizeList;
Quill.register(Size, true);

// Register custom fonts
const Font = Quill.import('formats/font') as any;
Font.whitelist = fontList;
Quill.register(Font, true);

export default function Guidance({
    saveData,
    value,
    id,
    readonly,
}: {
    saveData: (id: string, data: string) => void;
    value: string;
    id: string;
    readonly: boolean;
}) {

    const selectedImageIndexRef = useRef(-1)
    const editorRef = useRef<Quill | null>(null);
    const quillRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const resizing = useRef(false); //awful solution for unknown image resize bug
    const [currentContent, setCurrentContent] = useState(value);
    const toolbarId = `toolbar-guided-checklist-${id}-${crypto.randomUUID().toString()}`;
    //const [mainToolbarElement, setMainToolbarElement] = useState<HTMLElement | null>(null);
    /*const [mainToolbarRect, setMainToolbarRect] = useState({
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        height: 0,
        width: 0,
    });*/
    //const [showToolbar, setShowToolbar] = useState(false);

    /*const updateToolbarPosition = useCallback(() => {
        if (!mainToolbarElement) return;

        const rect = mainToolbarElement.getBoundingClientRect();
        setMainToolbarRect({
            top: rect.top,
            left: rect.left,
            right: rect.right,
            bottom: rect.bottom,
            height: rect.height,
            width: rect.width,
        });
    }, [mainToolbarElement]);*/


    const debouncedSave = useDebouncedCallback(async (content: string) => {
        saveData(id, content);
    }, 300);

    useEffect(() => {
        Quill.register('modules/resize', ResizeModule);
        Quill.register(CustomImage, true);
        Quill.register(CustomVideo, true);
        Quill.register(CustomOrderedListContainerGuidance, true);
    }, []);

    // **Nueva función para insertar la imagen en Quill**
    const insertImageIntoQuill = useCallback((imageUrl: string) => {
        if (editorRef.current) {
            const editor = editorRef.current;
            const range = editor.getSelection(true); // Obtiene la posición actual del cursor
            editor.insertEmbed(range.index, 'image', imageUrl, 'user');
            editor.setSelection(range.index + 1); // Mueve el cursor después de la imagen
        }
    }, []);


    const handlePaste = useCallback((event: ClipboardEvent) => {
        event.stopPropagation(); // Previene el comportamiento por defecto de Quill para el pegado.
        const items = event.clipboardData?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        // y obtener la URL. Para este ejemplo, leeremos el archivo como Data URL.
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imageUrl = e.target?.result as string;
                            insertImageIntoQuill(imageUrl);
                        };
                        reader.readAsDataURL(file);
                        return;
                    }
                }
            }
        }
    }, [insertImageIntoQuill]);



    const handleDragOver = useCallback((event: DragEvent) => {
        event.preventDefault(); // Necesario para permitir el 'drop'
        event.stopPropagation(); // Importante para evitar que Quill maneje el dragover
        event.stopImmediatePropagation();
    }, []);

    const handleDrop = useCallback((event: DragEvent) => {
        event.preventDefault(); // Previene el comportamiento por defecto (abrir la imagen en una nueva pestaña)
        event.stopPropagation(); // Importante para evitar que Quill maneje el drop
        event.stopImmediatePropagation();
        if (resizing.current) return;

        const items = event.dataTransfer?.items;
        if (items) {
            for (let i = 0; i < items.length; i++) {
                if (items[i].kind === 'file' && items[i].type.indexOf('image') !== -1) {
                    const file = items[i].getAsFile();
                    if (file) {
                        // Aquí la misma lógica para subir la imagen y obtener la URL
                        const reader = new FileReader();
                        reader.onload = (e) => {
                            const imageUrl = e.target?.result as string;
                            insertImageIntoQuill(imageUrl);
                        };
                        reader.readAsDataURL(file);
                    }
                }
            }
        }
    }, [insertImageIntoQuill]);





    useEffect(() => {
        //const maintolbar = document.getElementById("toolbar")
        //setMainToolbarElement(maintolbar as HTMLElement);

        if (quillRef.current && !editorRef.current) {
            const options = {
                theme: 'snow',
                readOnly: readonly,
                placeholder: t('guidandece_placeholder'),
                modules: {
                    toolbar: {
                        container: `#${toolbarId}`,
                        handlers: {},
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
                },
                formats: [
                    'header',
                    'font',
                    'size',
                    'align',
                    'bold',
                    'italic',
                    'underline',
                    'strike',
                    'blockquote',
                    'list',
                    'color',
                    'background',
                    'link',
                    'image',
                    'video'
                ],
            };

            // create the editor
            editorRef.current = new Quill(quillRef.current, options);
            const editor = editorRef.current;
            const editorRoot = editorRef.current.root;


            //editorRoot.addEventListener('paste', handlePaste);
            editorRoot.addEventListener('dragover', handleDragOver);
            editorRoot.addEventListener('drop', handleDrop, true);

            if (value) {
                const delta = editorRef.current.clipboard.convert({ html: value });
                editorRef.current.setContents(delta);
                editorRef.current.root.innerHTML = value; // force visual update
            }

            editorRef.current.on('text-change', () => {
                if (resizing.current) return;
                const content = editorRef.current?.root.innerHTML || '';
                if (content === currentContent) return;
                setCurrentContent(content);
                debouncedSave(content);
            });


            // CORRECTED: Use click listener to detect image clicks
            const handleImageClick = (event: MouseEvent) => {
                const target = event.target as HTMLElement;
                if (target.tagName.toLowerCase() === 'img') {
                    const blot = Quill.find(target);
                    if (blot && blot !== editor) {
                        const index = editor.getIndex(blot as any);
                        selectedImageIndexRef.current = index;
                    }
                } else {
                    selectedImageIndexRef.current = -1;
                }
            };

            const handleOutsideClick = (event: MouseEvent) => {
                const target = event.target as Node;
                if (quillRef.current && !quillRef.current.contains(target)) {
                    selectedImageIndexRef.current = -1;
                }
            };

            editorRoot.addEventListener('click', handleImageClick);
            document.addEventListener('click', handleOutsideClick);

            quillRef.current.addEventListener('keydown', (e: KeyboardEvent) => {
                // borra la imagen dentro del editor del guidedCheckList
                if (selectedImageIndexRef.current !== -1 && (e.key === 'Delete' || e.key === 'Backspace')) {
                    e.stopPropagation();
                    e.preventDefault();
                    const editor = editorRef.current;
                    console.log(selectedImageIndexRef.current);
                    editor.deleteText(selectedImageIndexRef.current, 1, 'user');
                    selectedImageIndexRef.current = -1;
                    quillRef.current.click();
                }


                if (e.key === ' ') {
                    const editor = editorRef.current;

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
                                e.preventDefault(); // Prevent the space from being inserted
                                const numeroEncontrado = match[1]; // The captured group (the number)
                                const fullMatch = match[0]; // This includes the number and the dot (e.g., "1.")

                                // Calculate the start position of the text to delete
                                const startDeleteIndex = cursorIndex - fullMatch.length;

                                // Delete the number and the dot
                                editor.deleteText(startDeleteIndex, fullMatch.length);

                                // Get the current selection range again after deletion
                                const range = editor.getSelection();
                                if (!range) return;

                                const startIndex = Number(numeroEncontrado);

                                // Insert a new line if the current line is not empty,
                                // to ensure a clean start for the list item.
                                const [lineBlot, offsetInLine] = editor.getLine(range.index);
                                if (lineBlot && offsetInLine > 0) { // If cursor is not at the beginning of a line
                                    editor.insertText(range.index, '\n', Quill.sources.USER);
                                    editor.setSelection(range.index + 1, 0, Quill.sources.SILENT); // Move cursor to the new line
                                    range.index++; // Update range index for subsequent operations
                                }

                                // Apply the standard 'list' format with 'ordered'.
                                // This will create an <li> inside an <ol>.
                                editor.format('list', 'ordered', Quill.sources.USER);

                                // Find the parent <ol> (which should now be an instance of CustomOrderedListContainerGuidance)
                                // and set its data-start attribute and counter-reset style.
                                const [listItemBlot] = editor.getLine(range.index);
                                if (listItemBlot && listItemBlot.parent) {
                                    const listContainerBlot = listItemBlot.parent;
                                    const olNode = listContainerBlot.domNode;

                                    // Apply the data-start attribute and counter-reset style directly to the OL element
                                    olNode.setAttribute('data-start', startIndex.toString());
                                    // counter-reset is set to startIndex - 1 because the counter increments before displaying
                                    olNode.style.counterReset = `quill-list-counter ${startIndex - 1}`;
                                }
                            }
                        }
                    }
                }
            });


            return () => {
                //remove all the listeners to avoid memory leaks
                const editorRoot = editorRef.current?.root;
                if (editorRoot) {
                    editorRoot.removeEventListener('paste', handlePaste);
                    editorRoot.removeEventListener('dragover', handleDragOver);
                    editorRoot.removeEventListener('drop', handleDrop)

                }
                if (editorRef.current) {
                    editorRef.current = null;
                }
            };
        }
    }, []);

    // external changes sync
    useEffect(() => {
        if (editorRef.current && value !== currentContent) {
            editorRef.current.clipboard.dangerouslyPasteHTML(value);
            setCurrentContent(value);
        }
    }, [value]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (
                quillRef.current && quillRef.current.contains(event.target as Node) ||
                toolbarRef.current && toolbarRef.current.contains(event.target as Node)
            ) {
                console.log("guidance editor active")
                setActiveEditor(editorRef.current);
                //setShowToolbar(true);
            } else {
                //setShowToolbar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);



        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    /*useEffect(() => {
        if (!mainToolbarElement) return;

        // **Observer para cambios de tamaño del contenedor del editor**
        const containerObserver = new ResizeObserver(() => {
            updateToolbarPosition();
        });

        if (containerRef.current) {
            containerObserver.observe(containerRef.current);
        }

        // **Observer para cambios de tamaño de la toolbar principal**
        const toolbarObserver = new ResizeObserver(() => {
            updateToolbarPosition();
        });

        toolbarObserver.observe(mainToolbarElement);

        // Actualizar las dimensiones inicialmente
        updateToolbarPosition();

        // Añadir event listener para el redimensionamiento de la ventana
        window.addEventListener('resize', updateToolbarPosition);

        // esto previene un bug de redimensionamiento de imagenes
        const save = () => {
            const content = editorRef.current?.root.innerHTML || '';
            if (content === currentContent) return;
            setCurrentContent(content);
            debouncedSave(content);
        }
        window.addEventListener('mouseup', save);

        // Limpiar los observers y event listeners cuando el componente se desmonte
        return () => {
            window.removeEventListener('resize', updateToolbarPosition);
            window.removeEventListener('mouseup', save);
            containerObserver.disconnect();
            toolbarObserver.disconnect();
        };
    }, [mainToolbarElement, updateToolbarPosition]);*/




    return (
        <>
            {/*

                !readonly && (
                    <div
                        ref={toolbarRef}
                        style={{
                            position: 'fixed',
                            top: mainToolbarRect.top,
                            left: mainToolbarRect.left,
                            right: mainToolbarRect.right,
                            bottom: mainToolbarRect.bottom,
                            height: mainToolbarRect.height,
                            width: mainToolbarRect.width,
                            display: showToolbar ? 'block' : 'none',
                            zIndex: 10000,
                        }}
                        className=" flex justify-center w-full grow relative"
                    >
                        <div style={{ zIndex: "99999999 !important" }} >
                            <CustomToolbar name={toolbarId} clean={true} />
                        </div>
                    </div>
                )

*/
            }
         
            <div className="quill-editor-container" ref={containerRef} onPaste={e => e.stopPropagation()}>
                <div className="collapse-editor min-h-[300px]" ref={quillRef} />
            </div>
        </>
    );
}



