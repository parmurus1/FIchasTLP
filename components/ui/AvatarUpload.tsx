"use client";

import { useState, useRef } from "react";
import { createClient } from "@/lib/supabase/client";

interface Props {
  currentUrl?: string;
  userId: string;
  onUpload: (url: string) => void;
}

export function AvatarUpload({ currentUrl, userId, onUpload }: Props) {
  const [uploading, setUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(currentUrl ?? null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Preview
    const reader = new FileReader();
    reader.onload = () => setPreview(reader.result as string);
    reader.readAsDataURL(file);

    setUploading(true);
    const supabase = createClient();
    const ext = file.name.split(".").pop();
    const path = `avatars/${userId}-${Date.now()}.${ext}`;

    const { error } = await supabase.storage.from("avatars").upload(path, file, { upsert: true });

    if (!error) {
      const { data } = supabase.storage.from("avatars").getPublicUrl(path);
      onUpload(data.publicUrl);
    }

    setUploading(false);
  }

  return (
    <div className="flex flex-col items-center gap-3">
      <div
        className="w-24 h-24 rounded-full border-2 border-stone-700 overflow-hidden bg-stone-800 flex items-center justify-center cursor-pointer hover:border-parchment-500/50 transition-all"
        onClick={() => inputRef.current?.click()}
      >
        {preview ? (
          <img src={preview} alt="Avatar" className="w-full h-full object-cover" />
        ) : (
          <span className="text-3xl text-stone-600">⚔</span>
        )}
      </div>

      <button
        type="button"
        onClick={() => inputRef.current?.click()}
        disabled={uploading}
        className="font-display text-xs tracking-widest uppercase text-stone-400 hover:text-parchment-300 transition-colors disabled:opacity-50"
      >
        {uploading ? "Enviando..." : "Alterar Avatar"}
      </button>

      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFile}
      />
    </div>
  );
}
