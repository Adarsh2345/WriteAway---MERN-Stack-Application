/// <reference types="vite/client" />

// Quill loads as a global via a <script> tag in index.html (not an npm
// dependency), so TypeScript needs to be told it exists.
declare const Quill: any;
