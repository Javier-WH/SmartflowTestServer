/* eslint-disable @typescript-eslint/no-explicit-any */
import Quill from "quill";
// Import the default image blot
const Video = Quill.import('formats/video') as any;
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
            node.setAttribute('width', "200px");
            node.setAttribute('height', "100px");
        }
        return node;
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