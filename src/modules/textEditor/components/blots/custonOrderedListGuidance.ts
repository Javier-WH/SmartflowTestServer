/* eslint-disable @typescript-eslint/no-explicit-any */
import Quill from 'quill';

// Import the ListContainer blot, which represents <ol> and <ul> elements.
// This is the correct blot to extend for managing the <ol> and <ul> containers.
const ListContainer =  Quill.import('formats/list') as any;

/**
 * CustomOrderedListContainer extends Quill's ListContainer blot to add
 * support for the 'data-start' attribute on ordered lists (<ol>).
 * This allows for custom numbering of ordered lists in Quill.
 */
class CustomOrderedListContainerGuidance extends ListContainer {
  // Define the blot's name. Using a custom name to avoid conflicts with
  // Quill's default 'list' (ListItem) or 'list-container' blos,
  // unless you explicitly intend to override 'list-container'.
  // The original blotName 'list' with tagName ['OL', 'UL'] is contradictory
  // in standard Quill, as 'list' is typically for <li> elements.
  static blotName = 'custom-list-container';

  // Define the HTML tags this blot represents. This is correct for a container blot.
  static tagName = ['OL', 'UL'];

  // Define the specific tag for ordered lists for clarity.
  static ORDERED_TAG = 'OL';

  /**
   * Creates a new list container node (OL or UL).
   *
   * In standard Quill, the `value` passed to `ListContainer.create` is typically
   * 'ordered' or 'bullet'. Your original `react-quill` blot's `create` method
   * suggests it can also receive a number.
   *
   * This `create` method adapts to handle the `data-start` attribute if a number
   * is provided as the `value`, assuming it's intended for an ordered list.
   *
   * @param {string | number} value - The type of list ('ordered', 'bullet')
   * or the starting number for an ordered list.
   * @returns {HTMLElement} The created OL or UL element.
   */
  static create(value) {
    // Determine the actual type of list to pass to the parent's create method.
    // If a number is passed, we assume it's for an ordered list.
    const type = typeof value === 'number' ? CustomOrderedListContainerGuidance.ORDERED_TAG.toLowerCase() : value;

    // Call the parent's create method to get the base OL or UL DOM node.
    const node = super.create(type) as HTMLElement;

    // If the value provided is a number, apply the 'data-start' attribute
    // and set the CSS counter-reset property for custom numbering.
    if (typeof value === 'number') {
      node.setAttribute('data-start', value.toString());
      // `counter-reset` is used to control the numbering of ordered lists.
      // We subtract 1 because the counter increments before displaying the number.
      node.style.counterReset = `quill-list-counter ${value - 1}`;
    }

    return node;
  }

  /**
   * Formats the DOM node by reading its attributes.
   * This method is called by Quill to determine the format value of a given DOM node.
   *
   * @param {HTMLElement} domNode - The DOM node (OL or UL) to inspect.
   * @returns {string | number | undefined} The format value:
   * - The parsed 'data-start' number if it's an OL with data-start.
   * - 'ordered' if it's a standard OL without data-start.
   * - 'bullet' if it's a UL.
   * - `undefined` if no relevant format is found.
   */
  static formats(domNode) {
    const tagName = domNode.tagName;

    // If the node is an ordered list, check for the 'data-start' attribute.
    if (tagName === CustomOrderedListContainerGuidance.ORDERED_TAG) {
      const start = domNode.getAttribute('data-start');
      // If 'data-start' exists, return its parsed integer value.
      // Otherwise, return 'ordered' as the default format for an OL.
      return start ? parseInt(start, 10) : 'ordered';
    }

    // For unordered lists (UL) or if no custom start is applicable,
    // defer to the parent's formats method. This will typically return 'bullet' for UL.
    return super.formats(domNode);
  }
}

export default CustomOrderedListContainerGuidance;