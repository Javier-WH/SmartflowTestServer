/* eslint-disable @typescript-eslint/no-explicit-any */
import Quill from "quill";
import { uploadImageToStorage } from '../../imgStorage/imgStorage';
import PLACEHOLDER_SVG from "./LoadingImageSpinner.svg"

const Image = Quill.import('formats/image') as any;
export default class CustomImageGuidance extends Image {

    // When creating the image, we check if 'value' is an object that includes src, width, and height
    static create(value: any) {
        const node = super.create(value);
        const handleUpload = async (src: string) => {
            try {
                node.classList.add('uploadingImage');
                const base64Data = src.split(';base64,')[1];
                node.setAttribute('src', PLACEHOLDER_SVG);
                const url = await uploadImageToStorage(base64Data, "testImage");
                node.setAttribute('src', url);
            } catch (error) {
                console.error('Error uploading image:', error);
                node.setAttribute('src', src); // Mantiene base64 si hay error
            } finally {
                node.classList.remove('uploadingImage');
            }
        };
        if (typeof value === 'string' && value.startsWith('data:image/')) {
            handleUpload(value);
        } 

        // Only if the image does not already have a defined width, assign the default size
        if (!node.getAttribute("width")) {
            node.setAttribute("width", "300"); 
            //node.style.width = "300px";
        }
        if (!node.getAttribute("height")) {
            node.setAttribute("height", "200"); 
            //node.style.height = "200px";
        }

        return node;

    }


    // Only if the image does not already have a defined width, assign the default size
    static formats(domNode: HTMLElement) {
        const formats: { src: string | null; width?: string | null; height?: string | null; style?: string | null } = { src: domNode.getAttribute('src') };
        const style = domNode.getAttribute('style');
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