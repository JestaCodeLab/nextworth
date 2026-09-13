"use client";

import { useEffect, useRef, useState } from "react";
import { UploadCloud, X, FileText } from "lucide-react";
import { cn } from "@/lib/utils";

interface FileDropzoneProps {
  name: string;
  accept: string;
  description: string;
  onFileChange?: (file: File | null) => void;
}

function formatSize(bytes: number) {
  return bytes < 1024 * 1024 ? `${Math.round(bytes / 1024)} KB` : `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export function FileDropzone({ name, accept, description, onFileChange }: FileDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState(false);

  // Object URLs must be revoked when replaced/unmounted to avoid leaking memory.
  useEffect(() => {
    return () => {
      if (previewUrl) URL.revokeObjectURL(previewUrl);
    };
  }, [previewUrl]);

  function selectFile(next: File | null) {
    setFile(next);
    onFileChange?.(next);
    setPreviewUrl((current) => {
      if (current) URL.revokeObjectURL(current);
      return next && next.type.startsWith("image/") ? URL.createObjectURL(next) : null;
    });
  }

  function handleFiles(fileList: FileList | null) {
    const next = fileList?.[0];
    if (!next || !inputRef.current) return;
    // Native inputs won't accept an arbitrary File assignment directly —
    // routing it through a DataTransfer is the only way to set `.files` so
    // the surrounding <form>'s FormData still picks it up on submit.
    const dt = new DataTransfer();
    dt.items.add(next);
    inputRef.current.files = dt.files;
    selectFile(next);
  }

  function handleRemove(e: React.MouseEvent) {
    e.stopPropagation();
    if (inputRef.current) inputRef.current.value = "";
    selectFile(null);
  }

  return (
    <div>
      <input
        ref={inputRef}
        type="file"
        name={name}
        accept={accept}
        className="sr-only"
        onChange={(e) => handleFiles(e.target.files)}
      />

      {file ? (
        <div className="flex items-center gap-3 rounded-lg border p-3">
          {previewUrl ? (
            // eslint-disable-next-line @next/next/no-img-element -- ephemeral local blob preview, not a real asset
            <img src={previewUrl} alt={file.name} className="h-12 w-12 shrink-0 rounded-md object-cover" />
          ) : (
            <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-md bg-accent text-accent-foreground">
              <FileText className="h-5 w-5" />
            </div>
          )}
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{file.name}</p>
            <p className="text-xs text-muted-foreground">{formatSize(file.size)}</p>
          </div>
          <button
            type="button"
            onClick={handleRemove}
            aria-label="Remove file"
            className="shrink-0 cursor-pointer rounded-full p-1.5 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : (
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          onDragOver={(e) => {
            e.preventDefault();
            setDragOver(true);
          }}
          onDragLeave={() => setDragOver(false)}
          onDrop={(e) => {
            e.preventDefault();
            setDragOver(false);
            handleFiles(e.dataTransfer.files);
          }}
          className={cn(
            "flex w-full cursor-pointer flex-col items-center gap-1.5 rounded-lg border-2 border-dashed p-6 text-center transition-colors",
            dragOver ? "border-primary bg-accent/50" : "border-input hover:border-primary/50 hover:bg-muted/50",
          )}
        >
          <UploadCloud className="h-6 w-6 text-muted-foreground" />
          <p className="text-sm font-medium">
            Click to upload <span className="font-normal text-muted-foreground">or drag and drop</span>
          </p>
          <p className="text-xs text-muted-foreground">{description}</p>
        </button>
      )}
    </div>
  );
}
