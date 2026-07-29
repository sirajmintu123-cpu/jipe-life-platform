import { getToken } from "@/lib/api";

export interface UploadResponse {
  url: string;
}

export async function uploadFile(
  file: File,
  folder: string
): Promise<UploadResponse> {
  const formData = new FormData();

  formData.append("file", file);
  formData.append("folder", folder);

  const token = getToken();

  const response = await fetch("/api/upload", {
    method: "POST",
    headers: token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : {},
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json().catch(() => ({}));

    throw new Error(error.error || "Upload failed");
  }

  return response.json();
}