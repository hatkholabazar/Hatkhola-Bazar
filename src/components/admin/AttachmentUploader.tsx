"use client";

import { useState } from "react";
import { uploadToCloudinary } from "@/lib/cloudinary-client";
import {
  FaCloudUploadAlt,
  FaFileImage,
  FaTrash,
  FaSpinner,
  FaCheckCircle,
  FaExclamationTriangle,
  FaEye,
  FaTimes,
} from "react-icons/fa";
import { adminApi, IAttachmentMeta } from "@/lib/admin-api";
import { ADMIN_LABELS } from "@/config/admin-labels";

interface AttachmentUploaderProps {
  attachments: IAttachmentMeta[];
  onChange: (attachments: IAttachmentMeta[]) => void;
  maxFiles?: number;
}

export default function AttachmentUploader({
  attachments,
  onChange,
  maxFiles = 5,
}: AttachmentUploaderProps) {
  const [selectedKind, setSelectedKind] = useState("whatsapp_chat");
  const [caption, setCaption] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [previewModalUrl, setPreviewModalUrl] = useState<string | null>(null);

  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (attachments.length >= maxFiles) {
      setUploadError(`Maximum ${maxFiles} attachments allowed per batch.`);
      return;
    }

    // Check size < 5MB
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is larger than 5 MB limit. Please select a smaller photo.");
      return;
    }

    setUploadError(null);
    setIsUploading(true);

    try {
      const uploadResult = await uploadToCloudinary(file, selectedKind as any, true);

      const newAttachment: IAttachmentMeta = {
        publicId: uploadResult.publicId,
        resourceType: "image",
        format: uploadResult.format,
        bytes: uploadResult.bytes,
        kind: selectedKind,
        caption: caption.trim() || undefined,
        uploadedAt: new Date().toISOString(),
        url: uploadResult.secureUrl,
      };

      onChange([...attachments, newAttachment]);
      setCaption("");
      e.target.value = "";
    } catch (err: any) {
      setUploadError(err.message || "Failed to upload image. Please try again.");
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = (publicId: string) => {
    onChange(attachments.filter((a) => a.publicId !== publicId));
  };

  return (
    <div className="space-y-2.5">
      {/* Row 1: Document Kind & Note Input */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Attachment Type
          </label>
          <select
            value={selectedKind}
            onChange={(e) => setSelectedKind(e.target.value)}
            className="w-full text-xs bg-white border border-slate-300 text-slate-700 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-orange-500 font-medium"
          >
            {ADMIN_LABELS.attachmentKinds.map((k) => (
              <option key={k.value} value={k.value}>
                {k.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-[10px] font-bold text-slate-500 uppercase tracking-wider mb-1">
            Note / Slip # (Optional)
          </label>
          <input
            type="text"
            value={caption}
            onChange={(e) => setCaption(e.target.value)}
            placeholder="e.g. Steadfast memo 849"
            className="w-full text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 text-slate-700 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-orange-500"
          />
        </div>
      </div>

      {/* Row 2: Upload Action Button */}
      <div>
        <label
          className={`w-full cursor-pointer flex items-center justify-center gap-2 px-3 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-xs ${
            isUploading || attachments.length >= maxFiles
              ? "bg-slate-400 cursor-not-allowed"
              : "bg-emerald-600 hover:bg-emerald-700 active:scale-[0.99]"
          }`}
        >
          {isUploading ? (
            <>
              <FaSpinner className="animate-spin text-sm" />
              <span>Compressing & Uploading Proof...</span>
            </>
          ) : (
            <>
              <FaCloudUploadAlt className="text-base" />
              <span>Upload Proof Image ({attachments.length}/{maxFiles})</span>
            </>
          )}
          <input
            type="file"
            accept="image/jpeg,image/png,image/webp"
            disabled={isUploading || attachments.length >= maxFiles}
            onChange={handleFileSelect}
            className="hidden"
          />
        </label>
      </div>

      {uploadError && (
        <div className="p-2.5 bg-rose-50 border border-rose-200 rounded-lg text-xs text-rose-700 flex items-center gap-2">
          <FaExclamationTriangle className="text-rose-500 shrink-0" />
          <span>{uploadError}</span>
        </div>
      )}

      {/* Attachment Thumbnails Grid */}
      {attachments.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 pt-1">
          {attachments.map((att) => (
            <div
              key={att.publicId}
              className="relative p-2 rounded-lg border border-slate-200 bg-white flex flex-col justify-between shadow-xs group"
            >
              <div className="flex items-start justify-between gap-1 mb-1.5">
                <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded bg-orange-100 text-orange-800 truncate max-w-[120px]">
                  {att.kind.replace("_", " ")}
                </span>
                <button
                  type="button"
                  onClick={() => handleRemove(att.publicId)}
                  className="text-slate-400 hover:text-rose-600 transition-colors p-0.5"
                  title="Remove attachment"
                >
                  <FaTrash className="text-xs" />
                </button>
              </div>

              {att.caption && (
                <p className="text-[11px] text-slate-600 truncate mb-1" title={att.caption}>
                  {att.caption}
                </p>
              )}

              <div className="flex items-center justify-between text-[10px] text-slate-400 pt-1 border-t border-slate-100">
                <span>{(att.bytes / 1024).toFixed(0)} KB</span>
                {att.url && (
                  <button
                    type="button"
                    onClick={() => setPreviewModalUrl(att.url!)}
                    className="text-blue-600 hover:text-blue-800 font-medium inline-flex items-center gap-0.5"
                  >
                    <FaEye className="text-[9px]" /> View
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lightbox Modal */}
      {previewModalUrl && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4 backdrop-blur-xs">
          <div className="relative max-w-2xl w-full bg-white rounded-xl overflow-hidden shadow-2xl p-2">
            <button
              onClick={() => setPreviewModalUrl(null)}
              className="absolute top-4 right-4 z-10 bg-slate-900/70 text-white rounded-full p-2 hover:bg-slate-900 transition-colors"
            >
              <FaTimes className="text-sm" />
            </button>
            <div className="max-h-[80vh] overflow-auto flex items-center justify-center bg-slate-100 rounded-lg">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={previewModalUrl}
                alt="Document proof preview"
                className="max-h-[75vh] w-auto object-contain rounded"
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

