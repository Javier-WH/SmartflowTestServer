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
                    'video',
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
        }


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
