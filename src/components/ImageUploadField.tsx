"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ImageUploadFieldProps = {
  id: string;
  name: string;
  label: string;
  folder: "unidentified" | "identified";
  defaultValue?: string | null;
};

export function ImageUploadField({
  id,
  name,
  label,
  folder,
  defaultValue,
}: ImageUploadFieldProps) {
  const supabase = createClient();
  const [url, setUrl] = useState(defaultValue ?? "");
  const [isUploading, setIsUploading] = useState(false);

  async function handleUpload(file: File) {
    setIsUploading(true);

    const fileExt = file.name.split(".").pop();
    const fileName = `${crypto.randomUUID()}.${fileExt}`;
    const filePath = `${folder}/${fileName}`;

    const { error } = await supabase.storage
      .from("votm-items")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      });

    if (error) {
      console.error(error);
      alert(error.message);
      setIsUploading(false);
      return;
    }

    const { data } = supabase.storage
      .from("votm-items")
      .getPublicUrl(filePath);

    setUrl(data.publicUrl);
    setIsUploading(false);
  }

  return (
    <div className="space-y-2">
      <label htmlFor={id} className="text-sm text-zinc-300">
        {label}
      </label>

      <input type="hidden" name={name} value={url} />

      <input
        id={id}
        type="file"
        accept="image/*"
        onChange={(event) => {
          const file = event.target.files?.[0];
          if (file) {
            handleUpload(file);
          }
        }}
        className="w-full rounded-2xl border border-zinc-800 bg-zinc-900 px-4 py-3 text-sm text-zinc-300 outline-none focus:border-red-700"
      />

      {isUploading && (
        <p className="text-xs text-zinc-500">Uploading to the Mists...</p>
      )}

      {url && (
        <img
          src={url}
          alt={label}
          className="mt-3 aspect-[16/9] w-full rounded-xl object-cover"
        />
      )}
    </div>
  );
}