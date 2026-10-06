"use client";

import { useCallback, useEffect, useState } from "react";
import { TEST_ID } from "@/lib/test-ids";

export interface MediaPickerProps {
  value: string;
  onChange: (url: string) => void;
  /** Optional alt text field */
  alt?: string;
  onAltChange?: (alt: string) => void;
}

interface MediaItem {
  url: string;
  name: string;
}

export function MediaPicker({ value, onChange, alt, onAltChange }: MediaPickerProps) {
  const [items, setItems] = useState<MediaItem[]>([]);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch("/api/media");
      if (res.ok) {
        const data = (await res.json()) as MediaItem[];
        setItems(data);
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const handleUpload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/media", { method: "POST", body: form });
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string };
        setError(data.error ?? "Upload failed");
        return;
      }
      const data = (await res.json()) as { url: string };
      onChange(data.url);
      await load();
    } catch {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-[var(--space-2)]" data-testid={TEST_ID.mediaPicker}>
      <label className="edit-menu-field block">
        <span>Image URL</span>
        <input
          type="url"
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder="https://… or /uploads/…"
          aria-label="Image URL"
        />
      </label>
      {onAltChange != null && (
        <label className="edit-menu-field block">
          <span>Alt text</span>
          <input
            type="text"
            value={alt ?? ""}
            onChange={(e) => onAltChange(e.target.value)}
            placeholder="Describe the image"
            aria-label="Alt text"
          />
        </label>
      )}
      <label className="inline-flex items-center gap-[var(--space-2)] text-xs cursor-pointer">
        <span className="px-[var(--space-2)] py-[var(--space-1)] border border-[var(--border)] rounded bg-[var(--surface)]">
          {uploading ? "Uploading…" : "Upload image"}
        </span>
        <input
          type="file"
          accept="image/jpeg,image/png,image/gif,image/webp"
          className="sr-only"
          disabled={uploading}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) void handleUpload(file);
            e.target.value = "";
          }}
        />
      </label>
      {error && (
        <p className="text-xs text-[color-mix(in_srgb,#dc2626_70%,var(--foreground))]" role="alert">
          {error}
        </p>
      )}
      {items.length > 0 && (
        <div className="flex flex-wrap gap-[var(--space-1)] max-h-24 overflow-y-auto">
          {items.map((item) => (
            <button
              key={item.url}
              type="button"
              onClick={() => onChange(item.url)}
              className={`w-10 h-10 rounded border overflow-hidden ${
                value === item.url ? "border-[var(--accent)] ring-1 ring-[var(--accent)]" : "border-[var(--border)]"
              }`}
              aria-label={`Select ${item.name}`}
              title={item.name}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={item.url} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
