import imageCompression from "browser-image-compression";

export interface CloudinaryUploadResult {
  secureUrl: string;
  publicId: string;
  format: string;
  bytes: number;
}

/**
 * Universal Cloudinary client-side uploader
 * Compresses image, retrieves timestamped signature, and uploads directly to Cloudinary
 */
export async function uploadToCloudinary(
  file: File,
  kind: "product" | "refund" | "batch" | "other" = "other",
  isAdmin: boolean = false
): Promise<CloudinaryUploadResult> {
  const backendUrl =
    process.env.NEXT_PUBLIC_BACKEND_URL ||
    process.env.NEXT_PUBLIC_API_URL ||
    "http://localhost:5000";

  // 1. Client-side compression (<1.5MB, max 1600px)
  let fileToUpload: File = file;
  if (file.type.startsWith("image/")) {
    try {
      const options = {
        maxSizeMB: 1.5,
        maxWidthOrHeight: 1600,
        useWebWorker: true,
      };
      fileToUpload = await imageCompression(file, options);
    } catch {
      fileToUpload = file;
    }
  }

  // 2. Obtain signature from backend
  const endpoint = isAdmin
    ? `${backendUrl}/api/admin/uploads/sign`
    : `${backendUrl}/api/uploads/sign`;

  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (isAdmin && typeof window !== "undefined") {
    const adminToken = localStorage.getItem("hatkhola_admin_token");
    if (adminToken) {
      headers["Authorization"] = `Bearer ${adminToken}`;
    }
  }

  const signRes = await fetch(endpoint, {
    method: "POST",
    headers,
    credentials: "include",
    body: JSON.stringify({ kind }),
  });

  const signData = await signRes.json();
  if (!signRes.ok) {
    throw new Error(signData.error || "Failed to obtain upload authorization");
  }

  // 3. Direct upload to Cloudinary
  const formData = new FormData();
  formData.append("file", fileToUpload);
  formData.append("api_key", signData.apiKey);
  formData.append("timestamp", String(signData.timestamp));
  formData.append("signature", signData.signature);
  formData.append("folder", signData.folder);

  const cloudRes = await fetch(
    `https://api.cloudinary.com/v1_1/${signData.cloudName}/auto/upload`,
    {
      method: "POST",
      body: formData,
    }
  );

  if (!cloudRes.ok) {
    const errorJson = await cloudRes.json();
    throw new Error(errorJson.error?.message || "Cloudinary upload failed");
  }

  const cloudData = await cloudRes.json();

  return {
    secureUrl: cloudData.secure_url,
    publicId: cloudData.public_id,
    format: cloudData.format || "jpg",
    bytes: cloudData.bytes || fileToUpload.size,
  };
}

