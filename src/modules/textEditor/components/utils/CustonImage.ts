/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quill } from 'react-quill';
import { uploadImageToStorage } from '../../imgStorage/imgStorage';
//import PLACEHOLDER_SVG from "./LoadingImageSpinner1.svg"


// Import the default image blot
const Image = Quill.import('formats/image');
export default class CustomImage extends Image {
    // When creating the image, we check if 'value' is an object that includes src, width and height
    static create(value: any) {
        const node = super.create(value);

        const handleUpload = async (src: string) => {
            try {
                const base64Data = src.split(';base64,')[1];
                //node.setAttribute('src', PLACEHOLDER_SVG);
                const url = await uploadImageToStorage(base64Data, "testImage");
                node.setAttribute('src', url);
            } catch (error) {
                alert("ocurrió un error al subir la imagen");
                console.error('Error uploading image:', error);
                node.setAttribute('src', src); // Mantiene base64 si hay error
            }
        };
        if (typeof value === 'string' && value.startsWith('data:image/')) {
            handleUpload(value);
        } else if (value && typeof value === 'object') {
            if (value.src) {
                node.setAttribute('src', value.src);
            }
            if (value.width) {
                node.setAttribute('width', value.width);
            }
            if (value.height) {
                node.setAttribute('height', value.height);
            }
            if (value.style) {
                node.setAttribute('style', value.style);
            }
        } else {
            node.setAttribute('src', value);
            // node.setAttribute('width', '200'); 
            node.setAttribute('height', 'auto'); 
        }

        return node;
    }


    // When serializing the image, we return an object containing src, width, and height
    static formats(domNode: HTMLElement) {
        const formats: { src: string | null; width?: string | null; height?: string | null; style?: string | null } = { src: domNode.getAttribute('src') };
        const width = domNode.getAttribute('width');
        const height = domNode.getAttribute('height');
        const style = domNode.getAttribute('style');
        if (width) {
            formats.width = width;
        }
        if (height) {
            formats.height = height;
        }
        if (style) {
            formats.style = style
        }
        return formats;
    }

    // Allows you to update width and height when applying a format
    format(name: string, value: any) {
        if (name === 'width' || name === 'height' || name === 'style') {
            if (value) {
                this.domNode.setAttribute(name, value);
            } else {
                this.domNode.removeAttribute(name);
            }
        } else {
            super.format(name, value);
        }
    }
}



