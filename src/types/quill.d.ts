/**
 * Type declarations for Quill and related imports
 * This allows importing Quill library and CSS files without TypeScript errors
 */

declare module 'quill' {
  const Quill: any;
  export default Quill;
}

declare module 'quill/dist/quill.snow.css' {
  const content: any;
  export default content;
}

declare module 'quill/dist/quill.bubble.css' {
  const content: any;
  export default content;
}

declare module 'quill/dist/quill.core.css' {
  const content: any;
  export default content;
}
