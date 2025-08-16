"use client";

import { Editor, Viewer } from "@bytemd/react";
import math  from "@bytemd/plugin-math";
import  highlight  from "@bytemd/plugin-highlight";
import  gfm  from "@bytemd/plugin-gfm";
import "bytemd/dist/index.css";
import "katex/dist/katex.css";
import "highlight.js/styles/default.css";

interface LaTeXEditorProps {
  value: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  height?: number;
  mode?: "edit" | "view";
  className?: string;
}

const plugins = [
  math(),
  highlight(),
  gfm(),
];

export function LaTeXEditor({
  value,
  onChange,
  placeholder = "Écrivez votre contenu ici...\n\n**Markdown** et $\\LaTeX$ sont supportés!\n\nPour les équations inline: $E = mc^2$\n\nPour les blocs d'équations:\n$$\n\\int_{-\\infty}^{\\infty} e^{-x^2} dx = \\sqrt{\\pi}\n$$",
  height = 400,
  mode = "edit",
  className = "",
}: LaTeXEditorProps) {
  
  if (mode === "view") {
    return (
      <div className={`latex-viewer ${className}`}>
        <Viewer value={value} plugins={plugins} />
      </div>
    );
  }

  return (
    <div className={`latex-editor h-36 ${className}`} style={{ height }}>
      <Editor
        value={value}
        plugins={plugins}
        onChange={onChange}
        placeholder={placeholder}
      />
      <style jsx global>{`
        .latex-editor .bytemd {
          height: 100%;
        }
        
        .latex-editor .bytemd-toolbar {
          border-top: 1px solid #e5e7eb;
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          background-color: #f9fafb;
        }
        
        .latex-editor .bytemd-body {
          border-left: 1px solid #e5e7eb;
          border-right: 1px solid #e5e7eb;
          border-bottom: 1px solid #e5e7eb;
        }
        
        .latex-editor .bytemd-preview {
          background-color: #ffffff;
        }
        
        .latex-viewer {
          border: 1px solid #e5e7eb;
          border-radius: 0.375rem;
          padding: 1rem;
          background-color: #ffffff;
        }
        
        /* Styling pour les équations LaTeX */
        .katex {
          font-size: 1.1em;
        }
        
        .katex-display {
          margin: 1rem 0;
        }
        
        /* Styling pour le code */
        .hljs {
          background: #f8f9fa;
          border-radius: 0.25rem;
          padding: 0.5rem;
        }
        
        /* Tables GFM */
        .markdown-body table {
          border-collapse: collapse;
          margin: 1rem 0;
        }
        
        .markdown-body table th,
        .markdown-body table td {
          border: 1px solid #d0d7de;
          padding: 0.5rem 1rem;
        }
        
        .markdown-body table th {
          background-color: #f6f8fa;
          font-weight: 600;
        }
      `}</style>
    </div>
  );
}
