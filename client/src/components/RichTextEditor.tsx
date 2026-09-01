import { useEffect, useRef } from "react";

const TOOLBAR = [
  [{ font: [] }, { size: [] }],
  ["bold", "italic", "underline", "strike"],
  [{ color: [] }, { background: [] }],
  [{ header: [1, 2, 3, 4, 5, 6, false] }],
  [{ list: "ordered" }, { list: "bullet" }],
  [{ align: [] }],
  ["link", "image"],
  ["clean"],
];

interface Props {
  initialValue?: string;
  onChange: (html: string) => void;
}

// Thin hand-rolled wrapper around vanilla Quill (loaded globally via a
// <script> tag in index.html — see vite-env.d.ts), rather than a React
// wrapper package like react-quill, which has known issues double-mounting
// under React 18 StrictMode.
export function RichTextEditor({ initialValue, onChange }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const quillRef = useRef<any>(null);

  useEffect(() => {
    // Guards against StrictMode's dev-only double-invoke of effects — without
    // this check, Quill would be instantiated twice and render two toolbars.
    if (!containerRef.current || quillRef.current) return;

    const quill = new Quill(containerRef.current, {
      theme: "snow",
      placeholder: "Write your blog content here...",
      modules: { toolbar: TOOLBAR },
    });
    quillRef.current = quill;

    if (initialValue) {
      quill.root.innerHTML = initialValue;
    }

    quill.on("text-change", () => {
      onChange(quill.root.innerHTML);
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return <div ref={containerRef} style={{ height: 300 }} />;
}
