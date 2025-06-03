/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable react-hooks/exhaustive-deps */
import { useEffect, useRef, useState } from 'react';
import Quill from 'quill';
import 'quill/dist/quill.snow.css';
import ResizeModule from '@botom/quill-resize-module';
import CustomToolbar from '../toolbar/CustonToolbar';
import CustomImage from '../utils/CustonImageGuidance';
import CustomVideo from '../utils/CustonVideoGuidance';
import { useDebouncedCallback } from 'use-debounce';
import CustomOrderedListContainerGuidance from '../blots/custonOrderedListGuidance';

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

    const editorRef = useRef<Quill | null>(null);
    const quillRef = useRef<HTMLDivElement | null>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const toolbarRef = useRef<HTMLDivElement>(null);
    const resizing = useRef(false); //awful solution for unknown image resize bug
    const [currentContent, setCurrentContent] = useState(value);
    const toolbarId = `toolbar-guided-checklist-${id}-${crypto.randomUUID().toString()}`;
    const [mainToolbarElement, setMainToolbarElement] = useState<HTMLElement | null>(null);
    const [showToolbar, setShowToolbar] = useState(false);

    const debouncedSave = useDebouncedCallback((content: string) => {
        saveData(id, content);
    }, 300);

    useEffect(() => {
        Quill.register('modules/resize', ResizeModule);
        Quill.register(CustomImage, true);
        Quill.register(CustomVideo, true);
        Quill.register(CustomOrderedListContainerGuidance, true);
    }, []);

    const handlePaste = (e: ClipboardEvent) => {
        e.stopPropagation();
    };

    useEffect(() => {
        const maintolbar = document.getElementById("toolbar")
        setMainToolbarElement(maintolbar as HTMLElement);

        if (quillRef.current && !editorRef.current) {
            const options = {
                theme: 'snow',
                readOnly: readonly,
                placeholder: 'Add a guidance (if needed!)',
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

            const editorRoot = editorRef.current.root;

            editorRoot.addEventListener('paste', handlePaste);

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

            quillRef.current.addEventListener('keydown', (e: KeyboardEvent) => {
             
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
                setShowToolbar(true);
            } else {
                setShowToolbar(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);


    return (
        <>
            {

                !readonly && (
                    <div
                        ref={toolbarRef}
                        style={{
                            position: 'fixed',
                            top: mainToolbarElement?.getBoundingClientRect().top,
                            left: mainToolbarElement?.getBoundingClientRect().left,
                            display: showToolbar ? 'block' : 'none',
                            zIndex: 10000,
                        }}
                        className="flex justify-center w-full grow relative bg-gray-100"
                    >
                        <CustomToolbar name={toolbarId} clean={true} />
                    </div>
                )


            }
            <div className="quill-editor-container" ref={containerRef} onPaste={e => e.stopPropagation()}>
                <div className="collapse-editor min-h-[300px]" ref={quillRef} />
            </div>
        </>
    );
}
