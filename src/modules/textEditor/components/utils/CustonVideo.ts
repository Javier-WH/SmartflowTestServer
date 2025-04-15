/* eslint-disable @typescript-eslint/no-explicit-any */
import { Quill } from 'react-quill';
// Import the default image blot
const Video = Quill.import('formats/video');
export default class CustomVideo extends Video {
    // When creating the image, we check if 'value' is an object that includes src, width and height
    static create(value: any) {

        const node = super.create(value);
        if (value && typeof value === 'object') {
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

            let src = value;
            // Modificación para YouTube
            try {
                const url = new URL(value);
                if (url.hostname.includes('youtube.com')) {
                    url.searchParams.set('enablejsapi', '1');
                    url.searchParams.set('origin', window.location.origin);
                    src = url.toString();
                }
            } catch (e) {
                console.error(e);
            }
            node.setAttribute('src', src);
            node.setAttribute('width', "100%");
            node.setAttribute('height', "400px");
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